import { LightningElement, track } from 'lwc';
import Id from '@salesforce/user/Id';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import basePath from '@salesforce/community/basePath';
import changePassword from '@salesforce/apex/ApfsCoChangePasswordcontroller.changePassword';
export default class ApfsCoResetPasswordlwc extends LightningElement {
    // User Id of the current user
    userId = Id;

    // Current state of password fields
    @track currentPassword = '';
    @track newPassword = '';
    @track confirmPassword = '';

    // Flags for various validation states
    @track isCurrentPasswordIncorrect = false;
    @track isPasswordMismatch = false;
    @track isNewPasswordSameAsCurrent = false;
    @track isOldPasswordSame = false;
    @track isNewPasswordInvalid = false;
    @track isOldPasswordcriteria = false;
    @track errorMessage = '';
    @track successMessage = '';
    @track showValidation = false;

    // Input types for password fields (used for toggling visibility)
    @track oldinputType = 'password';
    @track newinputType = 'password';
    @track confirminputType = 'password';

    // Icon names for password visibility toggle
    @track oldiconName = 'utility:preview';
    @track newiconName = 'utility:preview';
    @track confirmiconName = 'utility:preview';

    // Flags to manage input validation
    checkOldPassword = false;
    checknewPassword = false;
    checkconfirmPassword = false;
    checknewPassworderror = false;
    isoldpasswordempty = false;
    isButtonDisabled=false;

    // Prevent paste operation in password fields
    preventPaste(event) {
        event.preventDefault();
    }

    // Add event listener for paste event on component connected
    connectedCallback() {
        this.template.addEventListener('paste', this.preventPaste);
    }

    // Remove event listener for paste event on component disconnected
    disconnectedCallback() {
        this.template.removeEventListener('paste', this.preventPaste);
    }

    // Handle change event for current password input
    handleCurrentPasswordChange(event) {
        this.currentPassword = event.target.value.trim();
        this.isCurrentPasswordIncorrect = false;
        this.checkOldPassword = false;
        this.isoldpasswordempty = false;
    }

    // Handle input for new password (prevent spaces and emojis)
    handlepasswordinput(event) {
        let inputChar = event.data || '';
        let spacePattern = /\s/;
        let emojiPattern = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
        if (spacePattern.test(inputChar) || emojiPattern.test(inputChar)) {
            event.preventDefault();
        }
    }

    // Toggle visibility of old password
    togglePasswordVisibility() {
        this.oldinputType = this.oldinputType === 'password' ? 'text' : 'password';
        this.oldiconName = this.oldinputType === 'password' ? 'utility:preview' : 'utility:hide';
    }

    // Toggle visibility of new password
    togglenewPasswordVisibility() {
        this.newinputType = this.newinputType === 'password' ? 'text' : 'password';
        this.newiconName = this.newinputType === 'password' ? 'utility:preview' : 'utility:hide';
    }

    // Toggle visibility of confirm password
    toggleconfirmPasswordVisibility() {
        this.confirminputType = this.confirminputType === 'password' ? 'text' : 'password';
        this.confirmiconName = this.confirminputType === 'password' ? 'utility:preview' : 'utility:hide';
    }

    // Handle change event for new password input
    handleNewPasswordChange(event) {
        this.newPassword = event.target.value.trim();
        if(this.newPassword.trim() !== '')
        {
            this.checknewPassworderror = false;
            this.checknewPassword = false;
        }
        
        // Validate new password criteria
        this.validatePasswordCriteria();
        this.checkPasswordMatch(); // Check if new password matches confirm password
    }

    // Handle focus event to show validation criteria
    handleFocus() {
        // this.validatePasswordCriteria();
        setTimeout(() => this.validatePasswordCriteria(), 0);
        this.showValidation = true;
    }

    // Validate new password criteria (uppercase, number, length)
    validatePasswordCriteria() {
        const passwordValue = this.newPassword;
        const letterElem = this.template.querySelector('[data-id="letter"]');
        const capitalElem = this.template.querySelector('[data-id="capital"]');
        const numberElem = this.template.querySelector('[data-id="number"]');
        const lengthElem = this.template.querySelector('[data-id="length"]');

        // Check for lowercase letters
        const lowerCaseLetters = /[a-z]/g;
        if (passwordValue.match(lowerCaseLetters)) {
            letterElem.classList.remove("invalid");
            letterElem.classList.add("valid");
        } else {
            letterElem.classList.remove("valid");
            letterElem.classList.add("invalid");
        }

        // Check for uppercase letters
        const upperCaseLetters = /[A-Z]/g;
        if (passwordValue.match(upperCaseLetters)) {
            capitalElem.classList.remove("invalid");
            capitalElem.classList.add("valid");
        } else {
            capitalElem.classList.remove("valid");
            capitalElem.classList.add("invalid");
        }

        // Check for numbers
        const numbers = /[0-9]/g;
        if (passwordValue.match(numbers)) {
            numberElem.classList.remove("invalid");
            numberElem.classList.add("valid");
        } else {
            numberElem.classList.remove("valid");
            numberElem.classList.add("invalid");
        }

        // Check for length
        if (passwordValue.length >= 8 && passwordValue.length <= 20) {
            lengthElem.classList.remove("invalid");
            lengthElem.classList.add("valid");
        } else {
            lengthElem.classList.remove("valid");
            lengthElem.classList.add("invalid");
        }
    }

    // Handle blur event to validate password after input loses focus
    handleBlur() {
        this.showValidation = false;
        this.isOldPasswordSame = this.currentPassword.trim() !== '' && this.newPassword.trim() !== '' && this.newPassword === this.currentPassword;

        // Validate new password against required pattern
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        this.isOldPasswordcriteria =this.newPassword.trim() !== '' && !passwordRegex.test(this.newPassword);
    }

    // Handle change event for confirm password input
    handleConfirmPasswordChange(event) {
        this.checkconfirmPassword = false;
        this.confirmPassword = event.target.value.trim();
        this.checkPasswordMatch(); // Check if confirm password matches new password
    }

    // Check if new and confirm passwords match
    checkPasswordMatch() {
        this.isPasswordMismatch = false;
        this.isPasswordMatch = false;

        if (this.newPassword && this.confirmPassword) {
            for (let i = 0; i < this.confirmPassword.length; i++) {
                if (this.confirmPassword[i] !== this.newPassword[i]) {
                    this.isPasswordMismatch = true;
                    return;
                }
            }
            if (this.newPassword.length === this.confirmPassword.length) {
                this.isPasswordMatch = true;
            }
        }
    }

    // Handle password change request
    handleChangePassword() {
    // Disable the button to prevent multiple clicks
    this.isButtonDisabled = true;
        // Perform validations before proceeding
        this.checkPasswordMatch();

        // Set validation flags
        this.isoldpasswordempty = !this.currentPassword;
        this.checknewPassword = !this.newPassword;
        this.checkconfirmPassword = !this.confirmPassword;
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        this.isOldPasswordcriteria = this.newPassword && !passwordRegex.test(this.newPassword);
        this.isOldPasswordSame = this.currentPassword.trim() !== '' && this.newPassword.trim() !== '' && this.newPassword === this.currentPassword;
        this.isPasswordMismatch = this.confirmPassword.trim() !== '' && this.newPassword.trim() !== '' && this.confirmPassword !== this.newPassword;
        this.isPasswordMatch = this.confirmPassword.trim() !== '' && this.newPassword.trim() !== '' && this.confirmPassword === this.newPassword;

        // Check for any validation errors
        const hasValidationErrors = this.isoldpasswordempty || this.checknewPassword || this.checkconfirmPassword || this.isOldPasswordcriteria || this.isOldPasswordSame || this.isPasswordMismatch;

        if (hasValidationErrors) {
            this.showToast('Error', 'Please correct the errors before saving.', 'error');
            this.isButtonDisabled = false; 
            return; // Exit early if there are validation errors
        }

        // Call the server-side method to change the password
        changePassword({
            userId: this.userId,
            verifyNewPassword: this.confirmPassword,
            newPassword: this.newPassword,
            oldPassword: this.currentPassword,
        })
        .then(() => {
  
            this.isOldPasswordSame = false;
            this.isPasswordMismatch = false;
            this.isNewPasswordInvalid = false;
            this.isPasswordMatch = false;
            this.checknewPassworderror = false;
            this.showToast('Success', 'Password changed successfully!', 'success');
            setTimeout(()=>{
                this.logOutPageUrl();
            },200)
         
        })
        .catch(error => {
            // Scroll to the top of the component on error
         this.template.querySelector('div.passwordClass').scrollIntoView({ behavior: 'smooth', block: 'start' });

            let errorMessage = 'An unexpected error occurred';
            if (error.body && error.body.message) {
                errorMessage = error.body.message;
            }

            // Set validation flags based on error message
            if (errorMessage === 'Your old password is incorrect.') {
                this.checkOldPassword = true;
                this.checknewPassworderror = false;
            } else if (errorMessage === 'The new password and current password are the same.') {
                this.checkOldPassword = false;
                this.checknewPassworderror = true;
            } else if (errorMessage === 'The new password does not match the required pattern.') {
                this.checkOldPassword = false;
                this.checknewPassworderror = true;
            } else {
                this.checkOldPassword = false;
                this.checknewPassworderror = false;
            }

            // Show error toast message
            this.showToast('Error', errorMessage, 'error');
            this.isButtonDisabled = false; 
        });
    }








  logOutPageUrl() {
    
    
    const sitePrefix = basePath.replace(/\/s$/i, "");
    window.location.href=`${sitePrefix}/secur/logout.jsp`;
     const studentPortalLoginPageUrl = `${basePath}/login`;

 }
       
    // Show toast messages
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title,
            message,
            variant,
        });
      
        this.dispatchEvent(evt);
    }

}