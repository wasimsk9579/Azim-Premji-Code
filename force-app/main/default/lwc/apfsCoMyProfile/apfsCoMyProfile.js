/**
 * @description       : 
 * @author            : owais.ahanger@cloudodyssey.co
 * @group             : 
 * @last modified on  : 10-07-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
import { LightningElement,track,wire} from 'lwc';
import { NavigationMixin } from "lightning/navigation";
import { refreshApex } from "@salesforce/apex";
import { getRecord, getFieldValue} from 'lightning/uiRecordApi';
import { updateRecord } from "lightning/uiRecordApi";
import CONTACT_ID from '@salesforce/schema/Contact.Id';
import CONTACT_DOB from '@salesforce/schema/Contact.Birthdate';
import USER_ENABLED from '@salesforce/schema/Contact.Is_Profile_Editable__c';
import PROFILE_COMPLETE from '@salesforce/schema/Contact.Is_Profile_Complete__c';
import CONTACT_EMAIL from '@salesforce/schema/Contact.Email';
import CONTACT_PHONE from '@salesforce/schema/Contact.MobilePhone';
import CONTACT_AADHAAR from '@salesforce/schema/Contact.Aadhaar_Number__c';
import CONTACT_STATE from '@salesforce/schema/Contact.State__c';
import CONTACT_DISTRICT from '@salesforce/schema/Contact.District__c';
import CONTACT_PIN from '@salesforce/schema/Contact.Full_Address_Pin_Code__c';
import CONTACT_ADDRESS from '@salesforce/schema/Contact.Full_Address__c';
import USER_ID from '@salesforce/user/Id';

import sendOtp from '@salesforce/apex/APFS_ApplicantMobileOtpHandler.sendOtp';
import verifyOtp from '@salesforce/apex/APFS_ApplicantMobileOtpHandler.verifyOtp';
import LightningAlert from 'lightning/alert';
import CONTACT_ID_FIELD from '@salesforce/schema/User.ContactId';

import getStatePicklistValues from '@salesforce/apex/APFS_StateDistrictUtilityController.getStatePicklistValues';
import getDistrictPicklistValues from '@salesforce/apex/APFS_StateDistrictUtilityController.getDistrictPicklistValues';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import basePath from '@salesforce/community/basePath';


// Import custom labels
import MY_PROFILE_HEADING from '@salesforce/label/c.MY_PROFILE_Heading';
import PERSONAL_INFORMATION_HEADING from '@salesforce/label/c.Personal_Information_Heading';
import FIRST_NAME_LABEL from '@salesforce/label/c.First_Name_Label';
import LAST_NAME_LABEL from '@salesforce/label/c.Last_Name_Label';
import GENDER_LABEL from '@salesforce/label/c.Gender_Label';
import DATE_OF_BIRTH_LABEL from '@salesforce/label/c.Date_of_Birth_Label';
import MOBILE_NUMBER_LABEL from '@salesforce/label/c.Mobile_Number_Label';
import PHONE_NUMBER_IS_VERIFIED from '@salesforce/label/c.Phone_number_is_verified';
import VERIFY_YOUR_MOBILE_NUMBER_LABEL from '@salesforce/label/c.Verify_Your_Mobile_Number_Label';
import SUCCESSFULLY_GENERATED_ONE_TIME_PASSWORD_OTP_LABEL from '@salesforce/label/c.Succesfully_Generated_One_Time_Password_OTP_Label';
import DIDNT_GET_THE_OTP_YET_LABEL from '@salesforce/label/c.Didn_t_get_the_OTP_yet_Label';
import EMAIL_ID_LABEL from '@salesforce/label/c.Email_Id_Label';
import FATHERS_NAME_LABEL from '@salesforce/label/c.Father_s_Name_Label';
import MOTHERS_NAME_LABEL from '@salesforce/label/c.Mother_s_Name_Label';
import AADHAAR_NUMBER_LABEL from '@salesforce/label/c.Aadhaar_Number_Label';
import UPLOAD_AADHAAR_CARD_LABEL from '@salesforce/label/c.Upload_Aadhaar_Card_Label';
import COMMUNICATION_ADDRESS_HEADING from '@salesforce/label/c.Communication_Address_Heading';
import STATE_LABEL from '@salesforce/label/c.State_Label';
import DISTRICT_LABEL from '@salesforce/label/c.District_Label';
import PIN_CODE_LABEL from '@salesforce/label/c.PIN_Code_Label';
import ADDRESS_FOR_COMMUNICATION_LABEL from '@salesforce/label/c.Address_for_Communication_Label';
import PROFILE_PICTURE_INFO_LABEL from '@salesforce/label/c.Profile_Picture_info_Label';
import PROFILE_PICTURE_UPLOAD_LABEL from '@salesforce/label/c.Upload_Profile_Picture_label';
import ERROR_LABEL from '@salesforce/label/c.Error_Label';
import DATE_OF_BIRTH_MINIMUM_LABEL from '@salesforce/label/c.DOB_Lessthan_15years_Label';
import INVALID_EMAIL_LABEL from '@salesforce/label/c.Invalid_Email';
import MOBILE_NUMBER_LESS_THAN_10_LABEL from '@salesforce/label/c.Mobile_Number_less_than_10_digits';
import PLEASE_VERIFY_YOUR_MOBILE_NUMBER_LABEL from '@salesforce/label/c.Please_verify_your_Mobile_Number';
import OTP_SENT_SUCCESSFULLY_LABEL from '@salesforce/label/c.OTP_sent_successfully';
import SUCCESS_TOAST_LABEL from '@salesforce/label/c.Success_Label';
import OTP_MUST_BE_EXACTLY_6_DIGITS_LABEL from '@salesforce/label/c.OTP_must_be_exactly_6_digits_label';
import INVALID_OTP_LABEL from '@salesforce/label/c.Invalid_OTP_label';
import MOBILE_NUMBER_VERIFIED_SUCCESSFULLY_LABEL from '@salesforce/label/c.Mobile_number_verified_successfully_label';
import HELP_TEXT_FOR_UPLOAD_LABEL from '@salesforce/label/c.Help_Text_For_Upload';
import INVALID_FILE_TYPE_ERROR_CUSTOM_LABEL from '@salesforce/label/c.Invalid_file_type_error_custom_label';
import PLEASE_UPLOAD_REQUIRED_DOCUMENTS_LABEL from '@salesforce/label/c.Please_Upload_Required_Documents_label';
import PIN_CODE_SHOULD_BE_EXACTLY_6_DIGITS_LABEL from '@salesforce/label/c.Pin_code_should_be_exactly_6_digits_label';
import 	AADHAAR_NUMBER_MUST_BE_EXACTLY_12_DIGITS from '@salesforce/label/c.Aadhaar_number_must_be_exactly_12_digits';
import AADHAAR_NUMBER_ALREADY_EXISTS_LABEL from '@salesforce/label/c.Aadhaar_Number_already_exists_label';
import MY_PROFILE_UPDATED_SUCCESSFULLY_LABEL from '@salesforce/label/c.My_profile_updated_successfully_label';
import COMPLETE_THIS_FIELD_LABEL from '@salesforce/label/c.Complete_this_field_Label';
import ENTER_OTP_LABEL from '@salesforce/label/c.Enter_OTP_Label';
import SELECT_AN_OPTION_LABEL from '@salesforce/label/c.Select_an_Option_label';
import UPLOADED_FILE_LABEL from '@salesforce/label/c.Uploaded_File_Label';
import ENTER_IN_ENGLISH_LABEL from '@salesforce/label/c.Please_enter_the_text_in_English_helptext';
 import PLEASE_UPLOAD_AADHAAR_CARD_LABEL from '@salesforce/label/c.Please_upload_Aadhaar_card';
import PLEASE_ENTER_AADHAAR_CARD_NUMBER_LABEL from '@salesforce/label/c.Please_enter_aadhaar_card_number';

const USER_FIELDS = [
    CONTACT_ID_FIELD,
    ];

const CONTACT_FIELDS =
    ['Contact.Id','Contact.FirstName','Contact.Is_Profile_Editable__c','Contact.Is_Aadhaar_Available__c',
        'Contact.LastName', 'Contact.Email','Contact.GenderIdentity',
        'Contact.Aadhaar_Number__c','Contact.MobilePhone',
        'Contact.Father_Full_Name__c','Contact.Mother_Full_Name__c','Contact.Birthdate','Contact.State__c',
        'Contact.District__c','Contact.Full_Address__c','Contact.Full_Address_Pin_Code__c','Contact.Is_Profile_Complete__c'];

export default class ApfsCoMyProfile extends NavigationMixin( LightningElement) {
    @track isDistrictDisabled = true;
    @track otpVerifiedstatus = true;
    @track toggleInputField=false;
    @track editButtonStatus=false;
    @track otp = '';
    @track isAadhaarValueEntered=true;
     @track isAadhaarEntered=false;
    @track otpSent = false;
    @track otpVerified = false;
    @track ResendStatus=false;
    @track profilePhotoEmpty=false;
    @track verifyButtonStatus = true;
    @track OTPError=false;
    isLoading = false;
    isLoadingInVerifyOtp=false;
    @track timeLeft = 60;
    timerInterval;
    @track fileUploadTypeError=false;
    @track fatherFullName;
    @track motherFullName;
    @track phone;
    @track AadhaarNumber;
    @track fileUploadError = false;
    @track isFileUploaded=false;
    @track fileDataList = [];
    base64=[];
    @track Address;
    @track EmailId;
   @track  DateofBirth;
   @track maxDate;

   fileList;
   fetchError;

    // Store imported labels in variables
    myProfileHeading = MY_PROFILE_HEADING;
    personalInformationHeading = PERSONAL_INFORMATION_HEADING;
    firstNameLabel = FIRST_NAME_LABEL;
    lastNameLabel = LAST_NAME_LABEL;
    genderLabel = GENDER_LABEL;
    dateOfBirthLabel = DATE_OF_BIRTH_LABEL;
    mobileNumberLabel = MOBILE_NUMBER_LABEL;
    phoneNumberIsVerified = PHONE_NUMBER_IS_VERIFIED;
    verifyYourMobileNumberLabel = VERIFY_YOUR_MOBILE_NUMBER_LABEL;
    successfullyGeneratedOneTimePasswordOtpLabel = SUCCESSFULLY_GENERATED_ONE_TIME_PASSWORD_OTP_LABEL;
    didntGetTheOtpYetLabel = DIDNT_GET_THE_OTP_YET_LABEL;
    emailIdLabel = EMAIL_ID_LABEL;
    fathersNameLabel = FATHERS_NAME_LABEL;
    mothersNameLabel = MOTHERS_NAME_LABEL;
    aadhaarNumberLabel = AADHAAR_NUMBER_LABEL;
    uploadAadhaarCardLabel = UPLOAD_AADHAAR_CARD_LABEL;
    communicationAddressHeading = COMMUNICATION_ADDRESS_HEADING;
    stateLabel = STATE_LABEL;
    districtLabel = DISTRICT_LABEL;
    pinCodeLabel = PIN_CODE_LABEL;
    addressForCommunicationLabel = ADDRESS_FOR_COMMUNICATION_LABEL;
    profilepictureinfolabel=PROFILE_PICTURE_INFO_LABEL;
    dateofbirthminimumlabel=DATE_OF_BIRTH_MINIMUM_LABEL;
    invalidemaillabel=INVALID_EMAIL_LABEL;
    mobilenumberlessthan10label=MOBILE_NUMBER_LESS_THAN_10_LABEL;
    otpmustbeexactly6digitslabel=OTP_MUST_BE_EXACTLY_6_DIGITS_LABEL;
    helptextforuploadlabel=HELP_TEXT_FOR_UPLOAD_LABEL;
    invalidfiletypeerrorcustomlabel=INVALID_FILE_TYPE_ERROR_CUSTOM_LABEL;
    pleaseuploadrequireddocumentslabel=PLEASE_UPLOAD_REQUIRED_DOCUMENTS_LABEL;
    pincodeshouldbe6digitslabel=PIN_CODE_SHOULD_BE_EXACTLY_6_DIGITS_LABEL;
    aadhaarnumbermustbe12digitslabel=AADHAAR_NUMBER_MUST_BE_EXACTLY_12_DIGITS;
    completethisfieldlabel=COMPLETE_THIS_FIELD_LABEL;
    enterotplabel=ENTER_OTP_LABEL;
    selectanoptionlabel=SELECT_AN_OPTION_LABEL;
    uploadedfilelabel=UPLOADED_FILE_LABEL;
    enterinenglishlabel=ENTER_IN_ENGLISH_LABEL;
    
    
    @track stateOptions = [];
    @track districtOptions = [];
    @track selectedState;
    @track selectedStateId;
    @track selectedDistrict;
    @track existingDistrict='';
    
    fileType = [];
    fileName = [];

    
    @track userContactId;
    
    @track isvalue=false;
    @track birthdisable = false;
    @track contactRecord;
    @track photoUrl = '';
    @track isPhotoEmpty = true;
    profilePictureUrl;
    profilePhoto = [];
    districtvalue;


    @wire(getRecord, { recordId: USER_ID, fields:USER_FIELDS})
    wiredUser({ error, data }) {
        if (data) {
            this.userContactId = getFieldValue(data, CONTACT_ID_FIELD); 
             
        } else if (error) {
            this.displayToast(ERROR_LABEL,'Failed to load user details.','error');
        }
    }
    @wire(getRecord, { recordId: '$userContactId', fields: CONTACT_FIELDS })
    wiredCombinedData({ error, data }) {
        if (data) {
            this.contactRecord = data;
            this.selectedState = this.state; 
            this.existingDistrict = this.district;
            this.fetchStatePicklistValues();

        } else if (error) {
            this.displayToast(ERROR_LABEL,'Failed to load contact details.','error');
        }
    }

    fetchStatePicklistValues() {
        getStatePicklistValues()
            .then((result) => {
                this.stateOptions = Object.keys(result).map((key) => ({
                    Id: key,
                    label: result[key],
                    value: result[key]
                }));
                
                if (this.selectedState) {
                    const stateOption = this.stateOptions.find(
                        (option) => option.value === this.selectedState
                    );
                    this.selectedStateId = stateOption ? stateOption.Id : '';

                    if (this.selectedStateId) {
                        this.loadDistrictPicklistValues(this.selectedStateId);
                    }
                }
            })
            .catch((error) => {
                this.displayToast(ERROR_LABEL,'Failed to load state details.','error');
            });
    }
    get firstName() {
        return getFieldValue(this.contactRecord, 'Contact.FirstName');
    }
    get lastName() {
        return getFieldValue(this.contactRecord, 'Contact.LastName');
    }

    get aadhaar(){
        return getFieldValue(this.contactRecord, 'Contact.Aadhaar_Number__c');
    
    }

    get aadhaaravailable(){
        return getFieldValue(this.contactRecord, 'Contact.Aadhaar_Number__c')!==null;
    
    }

    get email() {
        
        return getFieldValue(this.contactRecord, 'Contact.Email');
    }

    get gender() {
        return getFieldValue(this.contactRecord, 'Contact.GenderIdentity');
    }

    get PhoneNumber() {
        return getFieldValue(this.contactRecord, 'Contact.MobilePhone');
    }

    get birthDate() {
        return getFieldValue(this.contactRecord, 'Contact.Birthdate');
    }

    get state() {
        return getFieldValue(this.contactRecord, 'Contact.State__c');
        
    }

    get district() {
        return getFieldValue(this.contactRecord, 'Contact.District__c');
    }

    get fulladdress() {
        return getFieldValue(this.contactRecord, 'Contact.Full_Address__c');
    }

    get pincode() {
        return getFieldValue(this.contactRecord, 'Contact.Full_Address_Pin_Code__c');
    }

    get aadharavailable(){
        return getFieldValue(this.contactRecord, 'Contact.Is_Aadhaar_Available__c')==='Yes';
        
    }

    get profileeditable(){
        return getFieldValue(this.contactRecord, 'Contact.Is_Profile_Editable__c')===true;
        
    }

    get profilecomplete(){
        return getFieldValue(this.contactRecord, 'Contact.Is_Profile_Complete__c')===true;
        
    }
    
 
    handleStateChange(event) {
        this.selectedDistrict='';
        this.existingDistrict='';
      
        const selectedValue = event.detail.value;
        const selectedOption = this.stateOptions.find(option => option.value === selectedValue); 
        
        this.selectedState = selectedValue;
        this.selectedStateId = selectedOption.Id;
       
        if(this.profileeditable===true){
            this.selectedDistrict=undefined;
        }
      
       
        this.loadDistrictPicklistValues(this.selectedStateId);
    }
    
    loadDistrictPicklistValues(StateId) {
    getDistrictPicklistValues({ stateId: StateId })
        .then(result => {
            this.districtOptions = Object.keys(result).map(key => ({
                Id: key,
                label: result[key],
                value: result[key]
            }));
           
            const existingDistrictOption = this.districtOptions.find(option => option.value === this.existingDistrict);

            if (existingDistrictOption) {
                this.selectedDistrict = this.existingDistrict;
            } else {
                this.selectedDistrict = '';
            }
        })
        .catch(error => {
            this.displayToast(ERROR_LABEL,'Failed to load district details.','error');
        });
}


    handleDistrictChange(event) {
        this.selectedDistrict = event.detail.value; 

    }

    
    
    handleAddressChange(event) {
        this.Address = event.target.value.trim();  
    }
    

    handlePINChange(event) {
        this.PIN = event.target.value;
        
        
    }
    handleBirthDateChange(event){
        this.DateofBirth = event.target.value;
        
        
    }



    

  
    connectedCallback() {
       
        this.calculateMaxDate();
       
        
    }

    calculateMaxDate() {
        const today = new Date();
        const maxYear = today.getFullYear() - 15;
        const maxDate = new Date(maxYear, 12); 
        this.maxDate = maxDate.toISOString().split('T')[0]; 
    }


    handlePhoneChange(event) {
        this.phone = event.target.value;
        this.otpVerifiedstatus = false;
            if (this.phone.length === 10) {
                this.verifyButtonStatus = false; 
            } else {
                this.verifyButtonStatus = true;
            }
            
    }

    handleAadhaarChange(event){
        this.AadhaarNumber=event.target.value;
        if(this.AadhaarNumber.length===12){
            this.isAadhaarEntered=true;
            this.isAadhaarValueEntered=false;
        }
        
        else{
            this.isAadhaarEntered=false;
            this.isAadhaarValueEntered=true;
        }
    }
    

    handleSendOtp() {
        
        this.isLoading=true;
        if (this.phone) {
          
            sendOtp({ phoneNumber: this.phone })
                .then(() => {
                  
                    this.otpSent = true;
                    this.startTimer();
                    this.showToast(SUCCESS_TOAST_LABEL, OTP_SENT_SUCCESSFULLY_LABEL, 'success');
                    this.isLoading=false;
                })
                .catch((error) => {
                    this.showToast('Error sending OTP: ' + error.body.message, 'error',ERROR_LABEL);
                });
        } else {
            this.phoneError = true;
            this.showToast('Please enter a valid phone number', 'error', ERROR_LABEL);
        }
    }

    handleEditClick(){
        this.toggleInputField=false;
        this.editButtonStatus=false;
        this.otpVerifiedstatus=false;
        this.otpVerified=false;
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.timeLeft=59;
        }
        
 
    }

    handleModalCancel() {
        this.OTPError=false;
        this.otpSent = false;
      this.otp='';
      this.stopTimer();
     
      }

    handleChangeotpfield(event){
        this.otp=event.target.value;
        const otpLength = this.otp.length;
        this.OTPError = otpLength > 0 && otpLength < 6;
    }

    handleResendOtp() {
        this.startTimer();
        this.timeLeft = 59;
        this.handleSendOtp();
    }
    handleVerifyOtp() {
        this.isLoadingInVerifyOtp=true;
        if(this.otp==''){
            this.otpVerified = false;
                    this.showAlertForOtp('Please Enter OTP.', 'error', ERROR_LABEL);
                    this.isLoadingInVerifyOtp=false;
 
        }
        else{
        verifyOtp({ phoneNumber: this.phone, enteredOtp: this.otp })
            .then(result => {
                if (result) {
                    this.otpVerified = true;
                    this.showAlertForOtp(MOBILE_NUMBER_VERIFIED_SUCCESSFULLY_LABEL, 'success', SUCCESS_TOAST_LABEL);
                    this.otpVerifiedstatus = true;
                    this.isLoadingInVerifyOtp=false;
                    this.toggleInputField=true;
                    this.editButtonStatus=true;
                    this.otp='';
                } 
                else {
                   
                    this.otpVerified = false;
                    this.showAlertForOtp(INVALID_OTP_LABEL, 'error', ERROR_LABEL);
                    this.isLoadingInVerifyOtp=false;
                }
            })
            .catch(error => {
                this.showAlertForOtp('Error verifying OTP: ' + error.body.message, 'error', ERROR_LABEL);
                this.isLoadingInVerifyOtp=false;
            });
    }
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

    
 
 
 
    disconnectedCallback() {
    if (this.timerInterval) {
        clearInterval(this.timerInterval);
    } 
    }

    startTimer() {
        this.ResendStatus = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        } 
        this.timeLeft = 59;
        this.timerInterval = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft -= 1;
            } else {
                clearInterval(this.timerInterval);
                this.stopTimer();
                this.ResendStatus = true;
            }
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
        this.timeLeft = 0; 
    }

    handleEmailChange(event) {
        this.EmailId = event.target.value.toLowerCase();
      
       
        if(this.EmailId.checkValidity()){
            event.preventDefault();
            this.EmailId.reportValidity();
        }
        
    }

    handlePinBeforeInput(event){
        const pattern = /^[0-9]*$/;
   
            let inputChar = event.data || '';
            if (!pattern.test(inputChar)) {
                event.preventDefault();
            }
    }


    handleKeyPress(event) {
        const charCode = event.which ? event.which : event.keyCode;
        
        if (charCode < 48 || charCode > 57) {
            event.preventDefault();
        }
    }


    validateInput(event) {
        const pattern = /^[a-zA-Z\s]*$/; 
 
        let inputChar = event.data || '';
        if (!pattern.test(inputChar)) {
            event.preventDefault();
            }
    }

    validateaddressInput(event) {
        const pattern =/^[a-zA-Z0-9\s#,\./]*$/
        let inputChar = event.data || '';
        if (!pattern.test(inputChar)) {
            event.preventDefault();
        }
    }

    handleSave(event) {
        event.preventDefault();

        // Modified for new profile photo upload component
       //Start
        if(!this.isProfilePhotoUploaded){
            this.displayToast(ERROR_LABEL, PROFILE_PICTURE_UPLOAD_LABEL, 'error');
            return;
        }
        //End

         
       //Modified for new upload aadhaar card component 
       //Start
    
     if(this.aadharavailable){
        if(!this.isAadhaarUploaded){
            this.displayToast(ERROR_LABEL, PLEASE_UPLOAD_AADHAAR_CARD_LABEL, 'error');
            return;
        }
     }
     else{
             if(!this.profileeditable){
                if(this.isAadhaarEntered){
                    if(!this.isAadhaarUploaded){
                        this.displayToast(ERROR_LABEL, PLEASE_UPLOAD_AADHAAR_CARD_LABEL, 'error');
                        return;
                    }
                 }
             else if(this.isAadhaarUploaded){    
                if(!this.isAadhaarEntered){
                this.displayToast(ERROR_LABEL, PLEASE_ENTER_AADHAAR_CARD_NUMBER_LABEL, 'error');
                return;
                }
                
              }
           }

    }
        //End

        const allValid = [...this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-textarea')]
        .reduce((validSoFar, inputCmp) => {
            inputCmp.reportValidity();
            return validSoFar && inputCmp.checkValidity();
        }, true);


            
        if (allValid) {
            if (this.otpVerifiedstatus === false) {
                const evt = new ShowToastEvent({
                    title: ERROR_LABEL,
                    message: PLEASE_VERIFY_YOUR_MOBILE_NUMBER_LABEL,
                    variant: 'error'
                });
                this.dispatchEvent(evt);
                return;
            }

           
            this.updateContact();            
            return refreshApex(this.contactRecord);
        } else {
            this.showToast({
                title: 'Validation Error',
                message: 'Please fill out all required fields correctly.',
                variant: 'error'
            });
           
        }

    }
   
    async updateContact() {
        this.isLoading = true;
        const field = {};
        field[CONTACT_ID.fieldApiName] = this.userContactId;
        field[CONTACT_EMAIL.fieldApiName] = this.EmailId;
        field[CONTACT_DOB.fieldApiName] = this.DateofBirth;
        field[CONTACT_PHONE.fieldApiName] = this.phone;
        field[CONTACT_AADHAAR.fieldApiName] = this.AadhaarNumber;
        field[CONTACT_STATE.fieldApiName] =  this.selectedState;
        field[CONTACT_DISTRICT.fieldApiName] = this.selectedDistrict;
        field[CONTACT_PIN.fieldApiName] = this.PIN;
        field[CONTACT_ADDRESS.fieldApiName] = this.Address;
        field[USER_ENABLED.fieldApiName]=this.isAadhaarUploaded;
        field[PROFILE_COMPLETE.fieldApiName]=true; 

        const recordInput = { fields: field };
    
        try {
            
            await updateRecord(recordInput);
            this.isLoading = false;
            this.showToast(SUCCESS_TOAST_LABEL, MY_PROFILE_UPDATED_SUCCESSFULLY_LABEL, 'success');
            this.navigateToHome();
            return refreshApex(this.contactRecord);
        } catch (error) {
            this.isLoading = false;
            
            // Improved error handling with proper error message
            let errorMessage = error.body?.message || 'Something went wrong';
            if (error.body?.output?.errors) {
                const errors = error.body.output.errors;
                for (let i = 0; i < errors.length; i++) {
                    if (errors[i].errorCode === 'DUPLICATE_VALUE') {
                        errorMessage = AADHAAR_NUMBER_ALREADY_EXISTS_LABEL;
                    }
                }
            }
            
            this.showToast(ERROR_LABEL, errorMessage, 'error');
        }
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }


    handlePasswordChange(){
        this.navigateToChangePassword();
    }
    navigateToChangePassword() {

        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Change_Password__c'
          }
        });
    }
    navigateToHome(){
        const fullUrl=`${basePath}/`;
        window.location.href=fullUrl;
        
    }



    //Modified For New Profile Component
    isProfilePhotoUploaded = false; // Tracks the profile photo upload status

    /**
     * @description Handler for the `photouploadstatus` event from the child component.
     *              It updates the `isPhotoUploaded` property based on the event detail.
     * @param {Event} event - The custom event dispatched by the child component with the upload status.
     */
    handleProfilePhotoUploadStatus(event) {
        this.isProfilePhotoUploaded = event.detail.isUploaded;
       
    }

    isAadhaarUploaded = false; // Track the status of Aadhaar upload

    /**
     * @description Handle the custom event from the child component when Aadhaar upload status changes.
     * @param {Event} event - The event object carrying the detail about the Aadhaar upload status.
     */
    handleAadhaarUploadStatus(event) {
        this.isAadhaarUploaded = event.detail.isUploaded;
      
    }
    

    /**
   * @description Displays a toast message.
   * @param {String} Title - The title of the toast message.
   * @param {String} Message - The detailed  message to be displayed.
   * @param {String} Variant - The variant type to be displayed.
   * @fires ShowToastEvent - Dispatches a toast event to show the message.
   */
  displayToast(Title, Message,Variant) {
    const evt = new ShowToastEvent({
        title: Title,
        message: Message,
        variant: Variant
    });
    this.dispatchEvent(evt);
}
  
}