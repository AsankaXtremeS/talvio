import { profileRepository } from "./profile.repository";
import { UpdateProfileInput } from "./profile.validation";

interface ServiceError extends Error {
  statusCode?: number;
}

const buildHttpError = (message: string, statusCode: number): ServiceError => {
  const err: ServiceError = new Error(message);
  err.statusCode = statusCode;
  return err;
};

export interface EmployerProfileDTO {
  id: string;
  companyName: string;
  companyDescription: string | null;
  companyWebsite: string | null;
  companyLocation: string | null;
  companyLogoUrl: string | null;
  coverImageUrl: string | null;
  industry: string | null;
  companyType: string | null;
  companySize: string | null;
  foundedYear: number | null;
  specialties: string | null;
  linkedInUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  registrationFileUrl: string;
  registrationFileName: string;
  verificationStatus: string;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

const mapToDTO = (
  profile: NonNullable<Awaited<ReturnType<typeof profileRepository.findByUserId>>>
): EmployerProfileDTO => ({
  id: profile.id,
  companyName: profile.companyName,
  companyDescription: profile.companyDescription ?? null,
  companyWebsite: profile.companyWebsite ?? null,
  companyLocation: profile.companyLocation ?? null,
  companyLogoUrl: profile.companyLogoUrl ?? null,
  coverImageUrl: profile.coverImageUrl ?? null,
  industry: profile.industry ?? null,
  companyType: profile.companyType ?? null,
  companySize: profile.companySize ?? null,
  foundedYear: profile.foundedYear ?? null,
  specialties: profile.specialties ?? null,
  linkedInUrl: profile.linkedInUrl ?? null,
  facebookUrl: profile.facebookUrl ?? null,
  twitterUrl: profile.twitterUrl ?? null,
  registrationFileUrl: profile.registrationFileUrl,
  registrationFileName: profile.registrationFileName,
  verificationStatus: profile.verificationStatus,
  rejectionReason: profile.rejectionReason ?? null,
  createdAt: profile.createdAt.toISOString(),
  updatedAt: profile.updatedAt.toISOString(),
  user: {
    id: profile.user.id,
    email: profile.user.email,
    firstName: profile.user.firstName ?? null,
    lastName: profile.user.lastName ?? null,
  },
});

const resolveProfile = async (userId: string) => {
  const profile = await profileRepository.findByUserId(userId);
  if (!profile) throw buildHttpError("Employer profile not found.", 404);
  return profile;
};

export const profileService = {
  async getProfile(userId: string): Promise<EmployerProfileDTO> {
    const profile = await resolveProfile(userId);
    return mapToDTO(profile);
  },

  async updateProfile(userId: string, data: UpdateProfileInput): Promise<EmployerProfileDTO> {
    const profile = await resolveProfile(userId);
    if (profile.verificationStatus !== "APPROVED") {
      throw buildHttpError("Only approved employers can update their profile.", 403);
    }
    const updated = await profileRepository.updateByUserId(userId, data);
    return mapToDTO(updated);
  },
};