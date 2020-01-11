import {MinLength, MaxLength, IsString, IsAlphanumeric, Matches} from "class-validator";
import {Expose} from "class-transformer";



export class LogInData{
    /**
     * Nom d'utilisateur
     */
    @Expose()
    @IsString()
    @IsAlphanumeric()
    @MinLength(3,{message : "Username is too short"})
    @MaxLength(20, {message : "Username is too long"})
    username :string;

    /**
     * Mot de passe
     */
    @Expose()
    @IsString()
    @MinLength(3, { message : 'Password is too short' })
    @MaxLength(20, { message : 'Password is too long' })
    @Matches(/^\S*$/)
    password : string;
    constructor() {
        this.username ="";
        this.password ="";
    }
}