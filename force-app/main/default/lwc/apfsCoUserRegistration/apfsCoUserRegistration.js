/**
 * @description       : 
 * @author            : owais.ahanger@cloudodyssey.co
 * @group             : 
 * @last modified on  : 08-28-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
import { LightningElement, track} from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import basePath from '@salesforce/community/basePath';
import LightningAlert from 'lightning/alert';
import registerUser from '@salesforce/apex/APFS_UserRegistrationController.registerUser';
import setPassword from '@salesforce/apex/APFS_UserRegistrationController.setPassword';
import sendOtp from '@salesforce/apex/APFS_ApplicantMobileOtpHandler.sendOtp';
import verifyOtp from '@salesforce/apex/APFS_ApplicantMobileOtpHandler.verifyOtp';
 
export default class Registration1 extends NavigationMixin (LightningElement) {
    isApplicantEligible=false;
    isSpinnerLoading=false;

    firstname = '';
    lastName='';
    phoneNumber = '';
    updatedPhone = '';
    rollNumber='';
    aadharAvailable = '';
    aadharNumber = '';
    password = '';
    confirmPassword = '';


    @track isModalOpen = false;
    @track isUpdateModalOpen = false;
    
    @track lengthIcon = 'utility:close';
    @track letterIcon = 'utility:close';
    @track numberIcon = 'utility:close';
    @track passwordMismatch = false;
    @track PasswordMatch = false;
    @track showValidation = false;
   
    @track IsAllFieldsCompleted=true;
    @track passwordinputType = 'password';
    @track confirmpasswordinputType = 'password';
    @track iconName = 'utility:preview';
    @track confirmiconName = 'utility:preview';
    @track otp = '';
    @track otpSent = false;
    @track otpVerified = false;
    @track isconfirmpasswordempty=false;
    @track isnewpasswordempty=false; 
    @track isNewPasswordcriteria=false;
    @track toggleInputField=false;
    @track editButtonStatus=false;
   
   
    @track otpVerifiedstatus = false;
    @track ResendStatus=false;
    @track verifyButtonStatus = true;
    @track timeLeft = 60;
    @track consent =false;
    timerInterval;

 
    handleInputValidation(event) {
        const inputField = event.target;
        if (inputField.name === 'password') {
            this.password = inputField.value;
            this.validatePassword();
        } else {
            this.validateInputFields(inputField);
        }
    }

    validateInputFields(inputField) {
        let isValid = true;
        let message = '';

        switch(inputField.name) {
            case 'phone-number':
                if (!/^[0-9]{10}$/.test(inputField.value)) {
                    isValid = false;
                    message = 'Please enter a valid 10-digit phone number.';
                }
                break;
            case 'first-name':
            case 'last-name':
                if (!/^[a-zA-Z\s]*$/.test(inputField.value)) {
                    isValid = false;
                    message = 'Please enter alphabetic characters only.';
                    this.NameError = true;
                } else {
                    this.NameError = false;
                }
                break;
            case 'aadhaar-number':
                if (!/^[0-9]{12}$/.test(inputField.value)) {
                    isValid = false;
                    message = 'Please enter a valid 12-digit Aadhaar number.';
                }
                break;
            case 'roll-number':
                if (!/^[a-zA-Z0-9]*$/.test(inputField.value)) {
                    isValid = false;
                    message = 'Roll number must contain only alphanumeric characters.';
                }
                break;
            case 'password':
                if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/.test(inputField.value)) {
                    isValid = false;
                    message = 'Password must contain at least one lowercase letter, one uppercase letter, one number, and be at least 8 characters long.';
                    this.showValidation = true;
                } else {
                    this.showValidation = false;
                }
                break;
            case 'confirmPassword':
                if (inputField.value !== this.password) {
                    isValid = false;
                    message = 'Passwords do not match.';
                }
                break;
            case 'consent':
                if (!inputField.checked) {
                    isValid = false;
                    message = 'You must agree to the terms and conditions.';
                }
                break;
        }

        inputField.setCustomValidity(isValid ? '' : message);
        inputField.reportValidity();
        this.checkIfAllFieldsCompleted();
    }

    validatePassword() {
        this.showValidation = true;
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
            if (this.password.match(criterion.regex)) {
                elem.classList.add('valid');
                elem.classList.remove('invalid');
            } else {
                elem.classList.add('invalid');
                elem.classList.remove('valid');
            }
        });
    }

    checkIfAllFieldsCompleted() {
        const allInputs = this.template.querySelectorAll('lightning-input');
        const allValid = [...allInputs].every(input => input.checkValidity());
        this.IsAllFieldsCompleted = allValid;
    }

  
    handleEditClick(){
        this.toggleInputField=false;
        this.editButtonStatus=false;
        this.otpVerifiedstatus=false;
        this.otpVerified=false;

    }


    validateInput(event) {
        const pattern = /^[a-zA-Z\s]*$/; // Allow letters and spaces
 
        let inputChar = event.data || '';
        if (!pattern.test(inputChar)) {
            event.preventDefault();
            }
    }
    handleKeyPress(event) {
        const charCode = event.which ? event.which : event.keyCode;
        // Allow only numbers
        if (charCode < 48 || charCode > 57) {
            event.preventDefault();
        }
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




  handleSubmitRegistrationForm(event) {
         event.preventDefault();
    
        this.isconfirmpasswordempty = !this.confirmPassword; 
        this.isnewpasswordempty = !this.newPassword;
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        this.isNewPasswordcriteria =this.newPassword.trim() !== '' && !passwordRegex.test(this.newPassword);

        this.PasswordMatch = false;
        if(this.firstname ==''){
          this.NameError = true;
        }
        if(this.newPassword!= this.confirmPassword){
            this.passwordError = true ;
        }
         // Prevent default form submission behavior
        const firstName = this.firstname.trim();
        const lastName = this.lastName.trim();
        const mobileNumber = this.phoneNumber;
        const isAadharAvailable=this.aadharAvailable==='Yes'?true:false;
        const aadhaarOrClassTenRollNumber=isAadharAvailable?this.aadharNumber:this.rollNumber;
        const passwordInput = this.newPassword;
       console.log('Registration Form Details',firstName,lastName,mobileNumber,aadhaarOrClassTenRollNumber,isAadharAvailable,passwordInput);
       console.log('Form submitted successfully');
       //this.createNewUser(firstName,lastName,mobileNumber,aadhaarOrClassTenRollNumber,isAadharAvailable,passwordInput);
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
      toggleconfirmPasswordVisibility(){
        if (this.confirmpasswordinputType === 'password') {
          this.confirmpasswordinputType = 'text';
          this.confirmiconName = 'utility:hide';
      } else {
          this.confirmpasswordinputType = 'password';
          this.confirmiconName = 'utility:preview';
      }

      }



      // OTP Funtionality 
 
      handleSendOtp() {
        console.log('verify clicked');
        if (this.phoneNumber) {
          console.log('under if');
            sendOtp({ phoneNumber: this.phoneNumber })
                .then(() => {
                  console.log('funtion called');
                    this.otpSent = true;
                    this.startTimer();
                    this.showToast('OTP sent successfully', 'success', 'Success');
                })
                .catch((error) => {
                    this.showToast('Error sending OTP: ' + error.body.message, 'error', 'Error');
                });
        } else {
            this.phoneError = true;
            this.showToast('Please enter a valid phone number', 'error', 'Error');
        }
    }
    
    handleChangeotpfield(event){
        this.otp=event.target.value;
    }
    
 
    handleVerifyOtp() {
        console.log('OTP Entred->',this.otp);
        if(this.otp==''){
            this.otpVerified = false;
                    this.showAlertForOtp('Please enter OTP', 'error', 'Error');

        }
        else{
        verifyOtp({ phoneNumber: this.phoneNumber, enteredOtp: this.otp })
            .then(result => {
                if (result) {
                    this.otpVerified = true;
                    this.showAlertForOtp('OTP verified successfully', 'success', 'Success');
                    this.otpVerifiedstatus = true;
                    this.toggleInputField=true;
                    this.editButtonStatus=true;
                    this.otp='';
                } else {
                    
                    this.otpVerified = false;
                    this.showAlertForOtp('Invalid OTP, please try again', 'error', 'Error');
                }
            })
            .catch(error => {
                this.showAlertForOtp('Error verifying OTP: ' + error.body.message, 'error', 'Error');
            });
    }
}

    handleResendOtp() {
        this.startTimer();
        this.handleSendOtp();

         // Reuse the existing method to resend OTP
    }


    handleModalCancel() {
      this.otpSent = false;
      this.otp='';
      this.stopTimer();
      
      }

      startTimer() {
          this.ResendStatus = false; // Initially set to false when the timer starts
          this.timeLeft = 60;
          this.timerInterval = setInterval(() => {
              if (this.timeLeft > 0) {
                  this.timeLeft -= 1;
              } else {
                  this.stopTimer();
                  this.ResendStatus = true;
              }
          }, 1000);
      }
  
      stopTimer() {
          clearInterval(this.timerInterval);
          this.timeLeft = 0; // Reset time for next use
      }

      // Aadhar card Related methods

      yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];
    
    get showAadharFields() {
        return this.aadharAvailable === 'Yes';
    }
    
    get showRollNumberField() {
        return this.aadharAvailable === 'No';
    }
    
    handleAadharAvailabilityChange(event) {
        this.aadharAvailable = event.detail.value;
    }
    
   
    
    handleRollNumberChange(event) {
        this.rollNumber = event.target.value;
    }

    checkInputFields() {
        // Trim any white space and check if the values are not empty
        const firstname = this.firstname ? this.firstname.trim() : '';
        const lastName = this.lastName ? this.lastName.trim() : '';
        const phoneNumber = this.phoneNumber ? this.phoneNumber.trim() : '';
        const password = this.newPassword? this.newPassword.trim() : '';
        const confirmPassword = this.confirmPassword ? this.confirmPassword.trim() : '';
        const aadharAvailable = this.aadharAvailable;
        const otpverifiedSuccess=this.otpVerified;
        // Check if all fields are completed and aadharAvailable is either 'true' or 'false'
        if (firstname && lastName && phoneNumber && (aadharAvailable === 'Yes' || aadharAvailable === 'No') && password &&confirmPassword && otpverifiedSuccess && this.consent) {
            this.IsAllFieldsCompleted = false;
        } else {
            console.log(firstname, lastName, phoneNumber, aadharAvailable, password, this.confirmPassword, this.otpVerified,this.consent); 
            console.log('Still, some values are not found');
            this.IsAllFieldsCompleted = true;
        }
    }
    



      /**
     * 
     *  this.createNewUser(firstName,lastName,mobileNumber,aadhaarOrClassTenRollNumber,isAadharAvailable,passwordInput);
     * 
     */
    createNewUser(firstName,lastName,mobileNumber,aadhaarOrClassTenRollNumber,isAadharAvailable,passwordInput){
      this.isSpinnerLoading = true; 
      registerUser({firstName:firstName,lastName:lastName,mobileNumber:mobileNumber,aadhaarOrClassTenRollNumber:aadhaarOrClassTenRollNumber,isAadhaarAvailable:isAadharAvailable})
          .then(result => {
              setTimeout(() => {
                this.createPassword(result,passwordInput);
            }, 5000);
          })
          .catch(error => {
            this.isSpinnerLoading = false;
            this.showAlert(error.body.message? error.body.message: "Something went wrong!",'error','Error');
              
          });
    }
      
    createPassword(userId, password) {
      setPassword({ userId, password })
          .then(() => {
              this.isSpinnerLoading = false;
              this.showRegistrationSuccessAlert('You will receive username via SMS for login.','success','Registration Successfull! (पंजीकरण सफल हुआ!)');
              
          })
          .catch(error => {
            this.isSpinnerLoading = false;
            this.showAlert('Reset password for the username received via SMS. (आपको लॉगिन के लिए उपयोगकर्ता नाम एसएमएस के माध्यम से प्राप्त होगा।)','error','Something went wrong!');
              
          });
  }



  showAlertForOtp(message, theme, label) {
    LightningAlert.open({
        message: message,
        theme: theme,
        label: label
    }).then(() => {
        if (this.otpVerified) {
            this.otpSent = false;
        } else {
            this.otpSent = true;
        }
    });
}


  showRegistrationSuccessAlert(message,theme,label){
  LightningAlert.open({
    message: message,
    theme: theme,
    label: label,
}).then(() => {
  this.redirectToLogin();
});
}

showAlert(message,theme,label){
  LightningAlert.open({
    message: message,
    theme: theme,
    label: label,
})
}

redirectToLogin() {
  this[NavigationMixin.Navigate]({
      type: 'standard__webPage',
      attributes: {
          url: basePath
      }
  });
}

preventPaste(event) {
    event.preventDefault();
}


connectedCallback() {
    this.template.addEventListener('paste', this.preventPaste);
  
}

disconnectedCallback() {
    this.template.removeEventListener('paste', this.preventPaste);
}

}