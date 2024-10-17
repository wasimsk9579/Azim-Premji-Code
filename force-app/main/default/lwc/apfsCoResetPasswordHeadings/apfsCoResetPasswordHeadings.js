/**
 * @description       : 
 * @author            : owais.ahanger@cloudodyssey.co
 * @group             : 
 * @last modified on  : 07-27-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
**/
import { LightningElement,api } from 'lwc';

export default class ApfsCoResetPasswordHeadings extends LightningElement {
    @api isUserNameSectionEnabled;
    @api isOtpSectionEnabled;
    @api isPasswordSectionEnabled;
}