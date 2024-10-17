/**
 * @description       : 
 * @author            : owais.ahanger@cloudodyssey.co
 * @group             : 
 * @last modified on  : 09-23-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
**/
import { LightningElement,api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import basePath from '@salesforce/community/basePath';
import LightningAlert from 'lightning/alert';
import registerUser from '@salesforce/apex/APFS_UserRegistrationController.registerUser';
import setPassword from '@salesforce/apex/APFS_UserRegistrationController.setPassword';

export default class ApfsCoUserSignupForm extends NavigationMixin(LightningElement) {


    yesNoOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

    @api verifiedMobileNumber;
    firstName = '';
    lastName = '';
    aadharNumber = '';
    rollNumber = '';
    password = '';
    confirmPassword = '';
    aadharAvailable='yes';
    isAadhaarAvailable=true;
    showAadhaarOrClassTenRollnoInput=true;
    isRollNumberAvailable = false; 
    isRegisterButtonDisabled=true;
    showModal = false;

    passwordIconName = 'utility:preview';
    confirmPasswordIconName = 'utility:preview';
    passwordInputType = 'password';
    confirmPasswordInputType = 'password';
    showPasswordCriteriaSection=false;
    isSpinnerLoading=false;
    
    handleInputValidation(event) {
        const input = event.target;
        const value = input.type === 'checkbox' ? input.checked : input.value;
        let message = '';

        if (input.name === 'first-name') {
            this.firstName = value.trim();
            if(this.firstName.length===0){
                message = 'Complete this field.';
            }
            else if (this.firstName.length < 3) {
                message = 'First name must contain minimum 3 charcters.';
            }
            else if (!this.firstName.match(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/)) {
                message = 'Please enter only alphabets.';
            }
        }

        if (input.name === 'last-name') {
            this.lastName = value.trim();
            if(this.lastName.length===0){
                message = 'Complete this field.';
            }
            else if (!this.lastName .match(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/)) {
                message = 'Please enter only alphabets.';
            }
        }

        if (input.name === 'aadhaar-number') {
            input.value = value.replace(/\D/g, ''); // Remove all non-digit characters          
            this.aadharNumber = input.value;
             if(this.aadharNumber.length ===0){
                message = 'Complete this field.';
            }
            else if (this.aadharNumber.length !== 12 || !this.aadharNumber.match(/^\d{12}$/)) {
                message = 'Aadhaar number must be exactly 12 digits.';
            }
        }

        if (input.name === 'roll-number') {
            this.rollNumber = value.trim();
            if(this.rollNumber.length ===0){
                message = 'Complete this field.';
            }
            else if(this.rollNumber.length<4){
                message = 'Roll number should contain atleast 4 characters.';
            }
            else if (!this.rollNumber.match(/^[a-zA-Z0-9-_\/]*$/)) {
                message = 'Roll number should only contain alphanumeric characters.';
            }
        }
       
        input.setCustomValidity(message);
        input.reportValidity();
        this.validateAllFields();
        
    }

    validateAllFields() {
        const allInputs = this.template.querySelectorAll('lightning-input');
        const allValid = Array.from(allInputs).every(input => input.checkValidity());

        const aadharSelectionValid = this.template.querySelector('lightning-radio-group').checkValidity();
        
        this.isRegisterButtonDisabled = !(allValid && aadharSelectionValid);
     
    }

    handleAadharSelection(event){
        this.aadharNumber='';
        this.rollNumber='';
        this.aadharAvailable = event.detail.value;
        this.isAadhaarAvailable =  this.aadharAvailable === 'yes';
        this.isRollNumberAvailable =  this.aadharAvailable === 'no';
        setTimeout(() => {
            this.setValidity(this.aadharAvailable);
            this.validateAllFields();
        }, 0);

        
    } 
    setValidity(value){
        const element = this.template.querySelector(
            value === 'yes' ? 'lightning-input[data-id="aadhaar-number"]' : 'lightning-input[data-id="roll-number"]'
        );
        element.setCustomValidity('Complete this field.');
        element.reportValidity();
    }

    //Password Component Validations
    handlePreventPaste(event){
        event.preventDefault();
    }
    togglePasswordVisibility(){
        if (this.passwordInputType === 'password') {
            this.passwordInputType = 'text';
            this.passwordIconName = 'utility:hide';
        } else {
            this.passwordInputType = 'password';
            this.passwordIconName = 'utility:preview';
        }

    }
    toggleConfirmPasswordVisibility(){
        if (this.confirmPasswordInputType === 'password') {
            this.confirmPasswordInputType = 'text';
            this.confirmPasswordIconName = 'utility:hide';
        } else {
            this.confirmPasswordInputType = 'password';
            this.confirmPasswordIconName = 'utility:preview';
        }
    }

handlePasswordInputFocus(){
    this.showPasswordCriteriaSection = true;
    setTimeout(() => this.validatePassword(), 0);
    this.reportValidity();
}
handlePasswordInputBlur(){
    this.showPasswordCriteriaSection = false;
        this.reportValidity();
       
}

handlePasswordChange(event) {
    this.password = event.target.value.replace(/\s/g, '');
    event.target.value = this.password;
    this.validatePassword();
    this.reportValidity();
    
}

handleConfirmPasswordChange(event) {
    this.confirmPassword = event.target.value.replace(/\s/g, '');
    event.target.value = this.confirmPassword;
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
        if (this.password.match(criterion.regex)) {
            elem.classList.add('valid');
            elem.classList.remove('invalid');
        } else {
            elem.classList.add('invalid');
            elem.classList.remove('valid');
        }
    });
}
reportValidity() {
    const passwordInput = this.template.querySelector('[data-id="password"]');
    const confirmPasswordInput = this.template.querySelector('[data-id="confirm-password"]');
    
    this.setValidityMessage(passwordInput, this.getPasswordValidityMessage());
    this.setValidityMessage(confirmPasswordInput, this.getConfirmPasswordValidityMessage());
    this.validateAllFields();
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
    if (!this.password) {
        return 'Complete this field.';
    } 
    if (!this.isPasswordValid()) {
        return 'Password does not meet the required criteria.';
    }
    return '';
}

getConfirmPasswordValidityMessage() {
    if (!this.confirmPassword) {
        return 'Complete this field.';
    }
    if (this.password !== this.confirmPassword) {
        return 'Passwords do not match.';
    }
    return '';
}

isPasswordValid() {
    return /[a-z]/.test(this.password) &&
           /[A-Z]/.test(this.password) &&
           /[0-9]/.test(this.password) &&
           /.{8,15}/.test(this.password);
}

handleOpenModal() {
    this.showModal = true;
}
closeModal() {
    this.showModal = false;
}

handleSubmitSignupForm(){

    this.showModal = false;
    const aadhaarOrClassTenRollNumber = this.isAadhaarAvailable ? this.aadharNumber : this.rollNumber;
   
        // Check for null or undefined values
        if (!this.firstName || !this.lastName || !this.verifiedMobileNumber || !aadhaarOrClassTenRollNumber || typeof this.isAadhaarAvailable !== 'boolean' || !this.password) {
            this.showAlert("Please fill in all required fields.", 'error', 'Error');
            return;
        }

    this.createNewUser(this.firstName, this.lastName, this.verifiedMobileNumber, aadhaarOrClassTenRollNumber, this.isAadhaarAvailable, this.password,);
}

   createNewUser(firstName,lastName,mobileNumber,aadhaarOrClassTenRollNumber,isAadharAvailable,finalPassword){
    this.isSpinnerLoading = true; 
    
    registerUser({firstName:firstName,lastName:lastName,mobileNumber:mobileNumber,aadhaarOrClassTenRollNumber:aadhaarOrClassTenRollNumber,isAadhaarAvailable:Boolean(isAadharAvailable)})
        .then(result => {
            setTimeout(() => {
              this.createPassword(result,finalPassword);
          }, 5000);
        })
        .catch(error => {
          this.isSpinnerLoading = false;
          this.showAlert(error.body.message? error.body.message: "Something went wrong!",'error','Error');
            
        });
  }
    
  createPassword(userId, finalPassword) {
    
    if (!userId) {
        this.showAlert('User Information not available at the moment. Please try again.', 'error', 'Error');
        return;
    }
    setPassword({userId: userId, password:finalPassword })
        .then(() => {
            this.isSpinnerLoading = false;
            this.showRegistrationSuccessAlert('You will receive username via SMS for login.','success','Registration Successful  (पंजीकरण सफल) ');
            
        })
        .catch(error => {
          this.isSpinnerLoading = false;
          this.showAlert('Something went wrong','error','Password Creation Failed');
            
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

}