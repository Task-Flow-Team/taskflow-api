import { UserRepository } from "@/contexts/domain/repositories";
import { VerifyEmailRequestBody, Mail } from "@/contexts/domain/models";
import { MailService } from '@/contexts/domain/services';
import { BadRequestException, Injectable, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import { verifyEmailTemplate } from '@/contexts/infrastructure/templates';

@Injectable()
export class ResendEmailVerificationUseCase {

    // This constructor takes a MailService, UserRepository, and ConfigService as dependencies
    constructor(
        @Inject('mailService') private mailService: MailService,
        @Inject('userRepository') private userRepository: UserRepository,
        @Inject('configService') private configService: ConfigService,
    ) {}

    // This method resends the verification email for a user.
    async resendEmailVerification(verifyEmailRequest: VerifyEmailRequestBody): Promise<boolean> {

        // Get the user by ID, and throw an error if it doesn't exist
        const user = await this.userRepository.findUniqueById(verifyEmailRequest.userId);

        // Check if the user already has a verified email, and throw an error if they do
        if(user.emailVerified) throw new BadRequestException('User already verified.');

        // Get the tokens by the user's ID
        const tokens = await this.userRepository.getTokensByIdentifier(user.id);
        
        // Define a variable to store the verification token
        let verificationToken;

        // If the user already has a token, use it, otherwise generate a new one
        if(tokens.length !== 0 && tokens[0].expires > new Date()) verificationToken = tokens[0].token;
        verificationToken = verificationToken || randomUUID();

        // Set the verification token for the user
        await this.userRepository.setVerificationToken(user.id, verificationToken);

        // Construct the verification URL with the token
        const appUrl = this.configService.get<string>('APP_URL');
        const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}`;

        const userName = user.name || 'New User';
        const mailToSend: Mail = {
            to: [{ name: userName, email: user.email }],
            from: {
                name: this.configService.get<string>('RESEND_FROM_NAME'),
                email: this.configService.get<string>('RESEND_FROM_EMAIL'),
            },
            subject: 'Verify your email — TaskFlow',
            text: `Hi ${userName}, please verify your email by clicking the link: ${verificationUrl}`,
            html: verifyEmailTemplate({ userName, verificationUrl }),
        };

        // Send the verification email using the MailService, and throw an error if it fails
        const mailSent = await this.mailService.send(mailToSend);
        if(!mailSent) throw new BadRequestException('Failed to re-send verification email.');

        // Return true to indicate that the email was sent successfully
        return true;
    }
}