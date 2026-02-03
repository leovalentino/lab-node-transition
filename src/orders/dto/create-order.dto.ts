import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  product: string;

  @IsNumber()
  @IsPositive()
  price: number;
}
