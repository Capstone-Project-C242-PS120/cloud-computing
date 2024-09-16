import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class UpdatePhoneNumberDto {
  @IsPhoneNumber(null, { message: 'Invalid phone number format' })
  @IsNotEmpty({ message: 'Phone number cannot be empty' })
  phoneNumber: string;
}
