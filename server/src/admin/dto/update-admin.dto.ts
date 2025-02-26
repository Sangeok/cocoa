export class UpdateAdminDto {
  name?: string;
  phoneNumber?: string;
}

export class UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
} 