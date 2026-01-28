import { IsString, IsNumber, IsOptional } from 'class-validator';

/**
 * SePay Webhook Payload DTO
 * Documentation: https://docs.sepay.vn
 */
export class SepayWebhookDto {
  @IsNumber()
  id: number;

  @IsString()
  gateway: string; // Bank name: BIDV, VCB, TCB, etc.

  @IsString()
  transactionDate: string; // Format: YYYY-MM-DD HH:mm:ss

  @IsString()
  @IsOptional()
  accountNumber?: string; // Bank account number

  @IsString()
  @IsOptional()
  subAccount?: string; // Sub account (if any)

  @IsString()
  transferType: string; // "in" (money received) or "out" (money sent)

  @IsNumber()
  transferAmount: number; // Amount in VND

  @IsNumber()
  @IsOptional()
  accumulated?: number; // Total balance after transaction

  @IsString()
  @IsOptional()
  code?: string; // Transaction code

  @IsString()
  content: string; // Transfer content/description - IMPORTANT for matching

  @IsString()
  @IsOptional()
  referenceCode?: string; // Reference code from SePay

  @IsString()
  @IsOptional()
  description?: string; // Additional description
}
