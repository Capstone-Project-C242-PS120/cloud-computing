import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAddressDto {
  @IsString({ message: 'Street must be a string' })
  @IsNotEmpty({ message: 'Street cannot be empty' })
  street: string;

  @IsString({ message: 'City must be a string' })
  @IsNotEmpty({ message: 'City cannot be empty' })
  city: string;

  @IsString({ message: 'Postal code must be a string' })
  @IsNotEmpty({ message: 'Postal code cannot be empty' })
  postalCode: string;
}
