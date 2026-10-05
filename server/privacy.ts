export interface TestimonyVisibility {
  userId: string;
  privacy: string;
  videoUrl?: string | null;
  moderationStatus?: string | null;
}

/** Public endpoints may show public text testimonies and approved videos only. */
export function canViewTestimony(testimony: TestimonyVisibility, viewerId?: string): boolean {
  if (viewerId && testimony.userId === viewerId) return true;
  return testimony.privacy === "public" &&
    (!testimony.videoUrl || testimony.moderationStatus === "approved");
}

/** Remove credential identifiers before returning the signed-in user's profile. */
export function toSafeUser<T extends { passwordHash?: unknown; googleId?: unknown }>(
  user: T | null | undefined,
): Omit<T, "passwordHash" | "googleId"> | undefined {
  if (!user) return undefined;
  const safeUser = { ...user };
  delete safeUser.passwordHash;
  delete safeUser.googleId;
  return safeUser;
}

/** Anonymous stories must not expose their owner's stable user ID. */
export function toSafeTestimony<T extends { userId: string; isAnonymous: boolean }>(
  testimony: T,
  viewerId?: string,
): T {
  if (testimony.isAnonymous && testimony.userId !== viewerId) {
    return { ...testimony, userId: undefined as unknown as string };
  }
  return testimony;
}

export interface TestimonyAuthor {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

/** Joined user rows must never leak account fields; anonymous stories hide their author. */
export function toSafeTestimonyUser(
  user: TestimonyAuthor | null | undefined,
  isAnonymous: boolean,
): Pick<TestimonyAuthor, "id" | "firstName" | "lastName" | "profileImageUrl"> | undefined {
  if (!user || isAnonymous) return undefined;
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageUrl: user.profileImageUrl,
  };
}
