import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { LimitedUserProfileDto } from 'src/common/dto/user.dto';
import { getDistanceKm } from 'src/common/utils/address.utils';
import { Interest } from 'src/interests/schema/interests.schema';
import { PreferencesService } from 'src/preferences/preferences.service';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class MatchingService {
  constructor(
    private usersService: UsersService,
    private preferenceService: PreferencesService,
  ) {}

  /**
   * Find potential matches through DB-level filtering
   * @param currentUserId string | User id of logged in user
   * @param limit default: 20 | Limit returned documents
   * @returns User candidates with weighted scores
   */
  async findMatches(
    currentUserId: string,
    candidateIds?: Types.ObjectId[],
    limit = 20,
  ): Promise<LimitedUserProfileDto[]> {
    const currentUser = await this.usersService.findById(currentUserId);
    if (!currentUser) throw new NotFoundException('User not found');
    let candidates: User[] = [];
    if (candidateIds) {
      candidates = await this.usersService.getSwipedCandidates(
        candidateIds || [],
      );
    } else {
      candidates = (await this.usersService.findCandidates(
        currentUserId,
      )) as User[];
    }

    let scoredCandidates: { candidate: User; totalScore: number }[] = [];
    if (candidates && candidates.length > 0) {
      scoredCandidates = await Promise.all(
        candidates.map(async (candidate: User) => {
          const interestScore = this.calculateInterestsScore(
            currentUser,
            candidate,
          );
          const preferenceScore = await this.calculatePreferenceScore(
            currentUser,
            candidate,
          );
          const activityScore = this.calculateActivityScore(candidate);
          const completeness = this.calculateProfileCompleteness(candidate);
          const profileScore = completeness < 1 ? completeness : 1.2;
          const totalScore =
            interestScore * 0.45 +
            preferenceScore * 0.25 +
            activityScore * 0.2 +
            profileScore * 0.1;

          return { candidate, totalScore };
        }),
      );
    }

    scoredCandidates.sort((a, b) => b.totalScore - a.totalScore);

    return scoredCandidates
      .slice(0, limit)
      .map(({ candidate, totalScore }) => ({
        _id: candidate.id,
        name: candidate.name,
        shortBio: candidate.shortBio ?? '',
        avatarUrl: candidate.avatar?.url || null,
        gender: candidate.gender,
        interests: candidate?.interests?.map((i: Interest) => i.name) ?? [],
        popularityScore: candidate.popularityScore ?? 0,
        score: totalScore,
        age: candidate.age ?? null,
      }));
  }

  /**
   * Calculates interest scores
   * @param user User
   * @param candidate User
   * @returns number
   */
  private calculateInterestsScore(user: User, candidate: User): number {
    const userInterests = Array.isArray(user.interests) ? user.interests : [];
    const candidateInterests = Array.isArray(candidate.interests)
      ? candidate.interests
      : [];
    const common = userInterests.filter((i) =>
      candidateInterests.includes(i),
    ).length;
    const totalUnique = new Set([...userInterests, ...candidateInterests]).size;
    return common / totalUnique || 0;
  }

  /**
   * Calculates preference score based on age, distance, and gender
   * @param user User
   * @param candidate User
   * @returns Promise<number>
   */
  private async calculatePreferenceScore(
    user: User,
    candidate: User,
  ): Promise<number> {
    const userPref = await this.preferenceService.findByUser(user.id);

    // Age score
    const age = Number(user.age);
    const mid = (userPref.minAge + userPref.maxAge) / 2;
    const ageRange = (userPref.maxAge - userPref.minAge) / 2;
    const ageScore = Math.max(0, 1 - Math.abs(age - mid) / ageRange);

    // Distance score
    const userLat = Number(user.address?.location?.coordinates[1]);
    const userLon = Number(user.address?.location?.coordinates[0]);
    const candidateLat = Number(candidate.address?.location?.coordinates[1]);
    const candidateLon = Number(candidate.address?.location?.coordinates[0]);
    const distance = getDistanceKm(
      userLat,
      userLon,
      candidateLat,
      candidateLon,
    );
    const distanceScore = Math.max(0, 1 - distance / userPref.maxDistance);

    // Gender score
    const genderScore = userPref.genderPreference.includes(
      String(candidate?.gender),
    )
      ? 1
      : 0;
    return ageScore * 0.4 + distanceScore * 0.4 + genderScore * 0.2 || 0;
  }

  /**
   * Calculates activity score
   * @param candidate User
   * @returns number
   */
  private calculateActivityScore(candidate: User): number {
    const secondsDiff =
      (Date.now() - new Date(String(candidate?.lastActiveAt)).getTime()) / 1000;
    const weekSeconds = 604800;
    return Math.max(0, 1 - secondsDiff / weekSeconds) || 0;
  }

  /**
   * Calculates profile completeness score
   * @param candidate User
   * @returns number
   */
  private calculateProfileCompleteness(candidate: User): number {
    let score = 0;
    let total = 0;

    // Check avatar
    total++;
    if (candidate.avatar?.url) score++;

    // Check short bio
    total++;
    if (candidate.shortBio && candidate.shortBio.trim().length > 0) score++;

    // Check interests
    total++;
    if (Array.isArray(candidate.interests) && candidate.interests.length > 0)
      score++;

    // Check address
    total++;
    const location = candidate.address?.location?.coordinates;
    if (
      Array.isArray(location) &&
      location.length === 2 &&
      typeof location[0] === 'number' &&
      typeof location[1] === 'number'
    ) {
      score++;
    }

    // Check email verification
    total++;
    if (candidate.isEmailVerified) {
      score++;
    }

    return total > 0 ? score / total : 0;
  }
}
