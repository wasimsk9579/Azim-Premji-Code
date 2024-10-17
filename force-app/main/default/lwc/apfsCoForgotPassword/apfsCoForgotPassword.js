/**
 * @description       : 
 * @author            : owais.ahanger@cloudodyssey.co
 * @group             : 
 * @last modified on  : 09-04-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
**/
import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import basePath from '@salesforce/community/basePath';
import LightningAlert from 'lightning/alert';
import resetPassword from '@salesforce/apex/APFS_ForgotPasswordController.resetPassword';
import verifyOtp from '@salesforce/apex/APFS_ApplicantMobileOtpHandler.verifyOtp';
import changePassword from '@salesforce/apex/APFS_ForgotPasswordController.changePassword';

export default class ApfsCoForgotPassword extends NavigationMixin(LightningElement) {


    isResetPasswordButtonDisabled = true;
    isVerifyOtpButtonDisabled = true;
    isResendOtpButtonDisabled = true;
    isSetPasswordButtonDisabled=true;

    userName = '';
    userPhoneNumber = '';
    userId = ''
    @track isLoading=false;

    showUserNameSection = true;
    showMobileNumberVerificationSection = false;
    showChangePasswordSection =false; 
    showValidation=false;

    isEnteredOtpCorrect = false;
    isPasswordChangedSuccessfully = false;
    iconName = 'utility:preview';
    confirmiconName = 'utility:preview';
    passwordinputType = 'password';
    confirmpasswordinputType = 'password';

    enteredOtp = '';
    confirmPassword = '';
    newPassword = '';

    timeLeft = 59;


    connectedCallback() {
     this.template.addEventListener('keydown', this.handleKeyDown.bind(this));
      
    }
    
    disconnectedCallback() {
        this.template.removeEventListener('keydown', this.handleKeyDown.bind(this));
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
}
    handlePreventPaste(event) {
        event.preventDefault();
    }
    handleKeyDown(event) {
        if (event.key === 'Enter') {
            if (!this.isSetPasswordButtonDisabled && this.showChangePasswordSection) {
                this.handleSetNewPassword();
            } else if (!this.isVerifyOtpButtonDisabled && this.showMobileNumberVerificationSection) {
                this.handleVerifyOtp();
            } else if (!this.isResetPasswordButtonDisabled && this.showUserNameSection) {
                this.handleResetPassword();
            }
        }
    }
    handleUsernameChange(event) {
        const inputField = event.target;
        inputField.value = inputField.value.replace(/\s/g, '');
        this.userName = inputField.value;
        this.checkFormValidity();
    }
    checkFormValidity() {
        const inputFields = this.template.querySelectorAll('lightning-input');
        let allValid = true;

        inputFields.forEach(field => {
            if (!field.checkValidity()) {
                allValid = false;
            }
        });

        this.isResetPasswordButtonDisabled = !allValid;
    }


    handleResetPassword() {
    // Check if the username is not empty
    this.isLoading=true;
    if (!this.userName) {
        this.isLoading=false;
        return;
    }
        const userName= this.userName + '@applicant.com';
        resetPassword({ username:userName })
            .then(result => {

                this.userId = result.userId;
                this.userPhoneNumber = result.mobilePhone;
                this.showMobileNumberVerificationSection = true;
                this.showUserNameSection = false;
                this.isLoading=false;
                this.startCountdown();
            })
            .catch(error => {
                this.showUserNameResponseAlert(error.body.message ? error.body.message : 'Something went wrong.Pleas try again', 'error', 'Error');
                this.isLoading=false;
            });
    }

    handleChangeOtpFieldValue(event) {
        const otpInput = event.target;
        const value=otpInput.value.replace(/\D/g, '');
        otpInput.value=value;
        this.enteredOtp =value;

        if (this.enteredOtp.length === 0) {
            otpInput.setCustomValidity('Complete this field.');
        }
        else if (this.enteredOtp.length !== 6) {
            otpInput.setCustomValidity('OTP must be exactly 6 digits.');
        } else {
            otpInput.setCustomValidity('');
        }

        otpInput.reportValidity();
        this.isVerifyOtpButtonDisabled = !otpInput.checkValidity();
    }

    handleVerifyOtp() {
        this.isLoading=true;
        verifyOtp({ phoneNumber: this.userPhoneNumber, enteredOtp: this.enteredOtp })
            .then(result => {
                if (result) {
                    this.isEnteredOtpCorrect = true;
                    this.showOtpResponseAlert('OTP verified successfully', 'success', 'Success  सफल');
                    this.isLoading=false;
                } else {
                    this.isEnteredOtpCorrect = false;
                    this.showOtpResponseAlert('Invalid OTP.', 'error', 'Error');
                    this.isLoading=false;
                }
            })
            .catch(error => {
                this.showOtpResponseAlert('Error verifying OTP: ' + error.body.message ? error.body.message : 'Something went wrong.', 'error', 'Error');
                this.isLoading=false;
            });
    }

    //Resend OTP Functionality
    handleResendOtp() {
        this.isLoading=true;
        this.handleResetPassword();
        this.timeLeft = 59;
        this.isResendOtpButtonDisabled = true;
    }

    startCountdown() {

        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        this.countdownInterval = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
            } else {
                clearInterval(this.countdownInterval);
                this.isResendOtpButtonDisabled = false;
            }
        }, 1000);
    }

    handleSetNewPassword() {
        this.isLoading=true;

        if (!this.userId) {
            this.showSetPasswordResponseAlert('User Information not available at the moment. Please try again.', 'error', 'Error');
            this.isLoading=false;
            return;
        }

        changePassword({ userId: this.userId, password: this.newPassword })
            .then(result => {
                this.isPasswordChangedSuccessfully = true;
                this.isLoading=false;
                this.showSetPasswordResponseAlert(
                    'Password reset successful.',
                    'success', 'Success  (सफल)');
            })
            .catch(error => {
                this.isPasswordChangedSuccessfully = false;
                this.isLoading=false;

                this.showSetPasswordResponseAlert(
                    error.body.message ? error.body.message : 'Something went wrong.',
                    'error', 'Error');

            });
    }
    showUserNameResponseAlert(message, theme, label) {
        LightningAlert.open({
            message: message,
            theme: theme,
            label: label
        });
    }

    showOtpResponseAlert(message, theme, label) {
        LightningAlert.open({
            message: message,
            theme: theme,
            label: label
        }).then(() => {
            if (this.isEnteredOtpCorrect) {
                this.showChangePasswordSection = true;
                this.showMobileNumberVerificationSection = false;
            }
        });
    }
    showSetPasswordResponseAlert(message, theme, label) {
        LightningAlert.open({
            message: message,
            theme: theme,
            label: label
        }).then(() => {
            if (this.isPasswordChangedSuccessfully) {
                this.redirectToLogin();
            }
        });
    }

    redirectToLogin() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: basePath
            }
        });
    }



    togglePasswordVisibility() {
        if (this.passwordinputType === 'password') {
            this.passwordinputType = 'text';
            this.iconName = 'utility:hide';
        } else {
            this.passwordinputType = 'password';
            this.iconName = 'utility:preview';
        }
    }

    toggleconfirmPasswordVisibility() {
        if (this.confirmpasswordinputType === 'password') {
            this.confirmpasswordinputType = 'text';
            this.confirmiconName = 'utility:hide';
        } else {
            this.confirmpasswordinputType = 'password';
            this.confirmiconName = 'utility:preview';
        }

    }

    //Password Component Validations
    handleNewPasswordChange(event) {
        this.newPassword = event.target.value.replace(/\s/g, '');
        event.target.value = this.newPassword;
        this.validatePassword();
        this.reportValidity();
    }

    handleConfirmPasswordChange(event) {
        this.confirmPassword = event.target.value.replace(/\s/g, '');
        event.target.value = this.confirmPassword;
        this.reportValidity();
    }

    handleFocus() {
        this.showValidation = true;
        setTimeout(() => this.validatePassword(), 0);
        this.reportValidity();
    }

    handleBlur() {
        this.showValidation = false;
        this.reportValidity();
    }

    validatePassword() {
        this.validatePasswordCriteria();
    }

    validatePasswordCriteria() {
        const criteria = [
            { regex: /[a-z]/, id: 'letter', message: 'A lowercase letter' },
            { regex: /[A-Z]/, id: 'capital', message: 'An uppercase letter' },
            { regex: /[0-9]/, id: 'number', message: 'A number character' },
            { regex: /.{8,15}/, id: 'length', message: '8-15 characters long' },
        ];

        criteria.forEach(criterion => {
            const elem = this.template.querySelector(`[data-id="${criterion.id}"]`);
            if (this.newPassword.match(criterion.regex)) {
                elem.classList.add('valid');
                elem.classList.remove('invalid');
            } else {
                elem.classList.add('invalid');
                elem.classList.remove('valid');
            }
        });
    }

    reportValidity() {
        const passwordInput = this.template.querySelector('[data-id="newPassword"]');
        const confirmPasswordInput = this.template.querySelector('[data-id="confirmPassword"]');
        
        this.setValidityMessage(passwordInput, this.getPasswordValidityMessage());
        this.setValidityMessage(confirmPasswordInput, this.getConfirmPasswordValidityMessage());
        this.checkSetPasswordButtonValidity();
    }

    setValidityMessage(input, message) {
        input.setCustomValidity(message);
        input.reportValidity();
        const inputContainer = input.closest('.input-container');
        const toggleIconElement = inputContainer.querySelector('.toggle-icon');

        if (message) {
            toggleIconElement.style.top = '31%'; 
        } else {
            toggleIconElement.style.top = '43%';
        }
       
    }
   

    getPasswordValidityMessage() {
        if (!this.newPassword) {
            return 'Complete this field.';
        } 
        if (!this.isPasswordValid()) {
            return 'New password does not meet the required criteria.';
        }
        return '';
    }

    getConfirmPasswordValidityMessage() {
        if (!this.confirmPassword) {
            return 'Complete this field.';
        }
        if (this.newPassword !== this.confirmPassword) {
            return 'Passwords do not match.';
        }
        return '';
    }

    isPasswordValid() {
        return /[a-z]/.test(this.newPassword) &&
               /[A-Z]/.test(this.newPassword) &&
               /[0-9]/.test(this.newPassword) &&
               /.{8,15}/.test(this.newPassword);
    }

    checkSetPasswordButtonValidity() {
        const passwordInput = this.template.querySelector('[data-id="newPassword"]');
        const confirmPasswordInput = this.template.querySelector('[data-id="confirmPassword"]');

        this.isSetPasswordButtonDisabled = !passwordInput.checkValidity() || !confirmPasswordInput.checkValidity();
    }


}