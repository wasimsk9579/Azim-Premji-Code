/**
 * @description       : 
 * @author            : owais.ahanger@cloudodyssey.co
 * @group             : 
 * @last modified on  : 09-04-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
import { LightningElement,track} from 'lwc';
import loginToPortal from '@salesforce/apex/APFS_CustomLoginController.loginToPortal';
import LightningAlert from 'lightning/alert';
import basePath from '@salesforce/community/basePath';

export default class ApfsCoCustomLogin extends LightningElement {


    username = '';
    password = '';
    isLoginDisabled = true;
    @track isLoading=false;

    handleUsernameChange(event) {
        this.username = event.target.value.trim();
        this.validateInputs();
    }

    handlePasswordChange(event) {
        this.password = event.target.value.replace(/\s/g, '');
        event.target.value = this.password;
        this.validateInputs();
       
    }


    validateInputs() {
        const usernameInput =this.refs.userName;
        const passwordInput = this.refs.userPassword;
        
        let isValid = true;

        // Username Validation
        if (!this.username) {
           
            usernameInput.setCustomValidity('Username is required.');
            isValid = false;
            
         }
         else {
            usernameInput.setCustomValidity('');
        }

        // Password Validation
        if (!this.password) {
            passwordInput.setCustomValidity('Password is required.');
            isValid = false;
        } else {
            passwordInput.setCustomValidity(''); 
        }

        usernameInput.reportValidity();
        passwordInput.reportValidity();

        // Disable the login button if any input is invalid
        this.isLoginDisabled = !isValid;

        return isValid;
    }


    handleLogin() {
        this.isLoading=true;
        
        const origin = window.location.origin;
        const pathname = window.location.pathname;
        
        // Find the position of "/s/" in the pathname and slice the string up to that position plus 3 characters to include "/s/"
        const sIndex = pathname.indexOf('/s/') + 3;
        const truncatedPathname = pathname.slice(0, sIndex);
        
        // Combine origin and truncated pathname
        const startUrl = origin + truncatedPathname;

        
    // Check if the username is not empty
    if (!this.username) {
        this.isLoading=false;
        return;
    }
        const userName= this.username + '@applicant.com';
       
            
            loginToPortal({ username:userName, password: this.password, startUrl: startUrl })
                .then(result => {
                          window.location.href=result;
                          this.isLoading=false;
                    })
                .catch(error => {
                    this.showAlert(error.body.message?error.body.message:'Something went wrong','error','Authentication Failed.');
                    this.isLoading=false;
                });
        
    }

    handlePreventPaste(event) {
        event.preventDefault();
    }


    get forgotPasswordUrl(){
                return `${basePath}/ForgotPassword`;
    }
    get selfRegisterUrl(){
        return `${basePath}/SelfRegister`;
    }

    showAlert(message,theme,label){
        LightningAlert.open({
          message: message,
          theme: theme,
          label: label,
      })
      }
}