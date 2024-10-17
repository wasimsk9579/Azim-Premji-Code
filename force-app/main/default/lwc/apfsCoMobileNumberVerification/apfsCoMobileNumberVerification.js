/**
 * @description       : 
 * @author            : owais.ahanger@cloudodyssey.co
 * @group             : 
 * @last modified on  : 08-30-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
import { LightningElement,track} from 'lwc';
import LightningAlert from 'lightning/alert';
import sendOtp from '@salesforce/apex/APFS_ApplicantMobileOtpHandler.sendOtp';
import verifyOtp from '@salesforce/apex/APFS_ApplicantMobileOtpHandler.verifyOtp';
import basePath from '@salesforce/community/basePath';

export default class ApfsCoMobileNumberVerification extends LightningElement {

   @track isLoading=false;
    showEnterMobileNumberSection=true;
    showEnterOtpScetion=false;
    showUserSignupFormSection=true;

    isSendOtpButtonDisabled = true;
    isVerifyOtpButtonDisabled=true;
    isResendOtpButtonDisabled=true;

    mobileNumber = '';
    enteredOtp='';
    timeLeft = 59;
    isOtpVerified=false;

    get loginPageUrl(){
        return basePath;
    }
    // Allow only numbers
    handleMobileNumberChange(event) {
        const input = event.target;
        const value = input.value.replace(/\D/g, ''); // Remove all non-digit characters
        input.value = value;
        this.mobileNumber = value; 

         // Validate the input and set custom messages
         this.validateMobileNumber(input);
    }

    validateMobileNumber(input) {
        const value = input.value;
      
        if(value.length ===0){
            input.setCustomValidity('Complete this field.');
        }
        else if (value.length !== 10) {
            input.setCustomValidity('Mobile number must be exactly 10 digits.');
           
        } else if (!/^\d+$/.test(value)) {
            input.setCustomValidity('Mobile number must contain only digits.');
        
        }else {
            input.setCustomValidity('');
        }

        input.reportValidity();
        this.isSendOtpButtonDisabled = !input.checkValidity();
    }


    handleSendOtp() {
        this.isLoading=true;
        if (!this.mobileNumber) {
            this.showAlert('Please enter your mobile number.', 'error', 'Error');
            return;
        }
       
            sendOtp({ phoneNumber: this.mobileNumber })
                .then(() => {
                    this.showEnterMobileNumberSection=false;
                    this.showUserSignupFormSection=false;
                    this.showEnterOtpScetion=true;
                    this.isLoading=false;
                    this.startCountdown();
                })
                .catch((error) => {
                    this.showAlert(' Failed To Send OTP: ' + error.body.message ? error.body.message : 'Something went wrong.', 'error', 'Error');
                    this.isLoading=false;
                });
        

    }
   
    //Allow to change mobile number from otp screen
    handleEditMobileNumber() {
        
        this.showEnterMobileNumberSection = true;
        this.isSendOtpButtonDisabled=false;

        this.showEnterOtpScetion=false;
        this.isVerifyOtpButtonDisabled = true;
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.timeLeft=59;
        }
        
        this.showUserSignupFormSection=false;
        
    }

    // Allow only numbers
    handleOtpChange(event) {
        const input = event.target;
        const value = input.value.replace(/\D/g, ''); // Remove all non-digit characters
        input.value = value;
        this.enteredOtp = value;

        // Validate the input and set custom messages
        this.validateOtp(input);
    }

    validateOtp(input) {
        const value = input.value;

        if (value.length === 0) {
            input.setCustomValidity('Complete this field.');
        }
        else if (value.length !== 6) {
            input.setCustomValidity('OTP must be exactly 6 digits.');
        } else if (!/^\d+$/.test(value)) {
            input.setCustomValidity('OTP must contain only digits.');            
        }
        else{
            input.setCustomValidity('');
        }

        input.reportValidity();
        this.isVerifyOtpButtonDisabled = !input.checkValidity();
    }

    //Verify Entered OTP
    handleVerifyOtp() {
        this.isLoading=true;
        if (!this.mobileNumber || !this.enteredOtp) {
            this.showAlert('Please enter both Mobile Number and OTP. (कृपया मोबाइल नंबर और ओटीपी दोनों दर्ज करें।)', 'error', 'Error');
            this.isLoading=false;
            return;
        }

        verifyOtp({ phoneNumber: this.mobileNumber, enteredOtp: this.enteredOtp })
            .then(result => {
                if (result) {
                  this.isOtpVerified=true;
                  this.isLoading=false;
                    this.showAlert('Mobile number verified successfully.  (मोबाइल नंबर सफलतापूर्वक सत्यापित किया गया।) ', 'success', 'Success');
                } else {
                    this.isOtpVerified=false;
                    this.isLoading=false;
                    this.showAlert('Invalid OTP.', 'error', 'Error');
                }
            })
            .catch(error => {
                this.isOtpVerified=false;
                this.isLoading=false;
                this.showAlert('Error verifying OTP. (ओटीपी सत्यापित करने में त्रुटि।): ' + error.body.message ? error.body.message : 'Something went wrong (कुछ गलत हो गया।)', 'error', 'Error');
            });
    }

  //Resend OTP Functionality
  handleResendOtp() {
    this.isLoading=true;
    this.handleSendOtp();
    this.timeLeft = 59;
    this.isResendOtpButtonDisabled = true;
    this.clearOtpInput();

}
//Clear OTP Input Value
clearOtpInput() {
    const otpInput = this.template.querySelector('.otp-verification-input lightning-input');
    if (otpInput) {
        this.isLoading=false;
        otpInput.value = '';
        this.enteredOtp = '';
        this.isVerifyOtpButtonDisabled = true;
    }
}

    showAlert(message, theme, label) {
        LightningAlert.open({
            message: message,
            theme: theme,
            label: label
        }).then(() => {
            if(this.isOtpVerified){
                this.showUserSignupFormSection=true;
                this.showEnterMobileNumberSection=false;
                this.showEnterOtpScetion=false;
            }
        });
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


    disconnectedCallback() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
}


}