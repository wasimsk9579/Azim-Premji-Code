import { LightningElement, api, wire,track } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { publish,subscribe, createMessageContext } from 'lightning/messageService';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import SR_APFS from '@salesforce/resourceUrl/SR_APFS';
import { getPicklistValues,getObjectInfo } from 'lightning/uiObjectInfoApi';
import APPLICATION_STATUS_COMMENT_OBJECT from '@salesforce/schema/Application_Status_Comment__c';
import APPLICATION_REJECTED_STATUS from '@salesforce/schema/Application_Status_Comment__c.Not_Selected_Draft_Reason__c';
import APPLICATION_ONHOLD_STATUS from '@salesforce/schema/Application_Status_Comment__c.On_Hold_Reason__c';
import getUploadedDocuments from '@salesforce/apex/APFS_ContactDocumentsController.getFilteredDocuments';
import getAdmissionRecords from '@salesforce/apex/APFS_ContactDocumentsController.getAdmissionRecords';
import getMissingDocumentTypes from '@salesforce/apex/APFS_ContactDocumentsController.getMissingDocumentTypes';
import getCurrentUserProfileName from '@salesforce/apex/APFS_ContactDocumentsController.getCurrentUserProfileName';
import createApplicationStatusComment from '@salesforce/apex/APFS_ContactDocumentsController.createApplicationStatusComment';
import getSchoolManagement from '@salesforce/apex/APFS_ContactDocumentsController.getSchoolManagementType';
import getInstituteManagement from '@salesforce/apex/APFS_ContactDocumentsController.getInstituteManagement';
import getDynamicPicklistValues from '@salesforce/apex/APFS_ContactDocumentsController.getDynamicPicklistValues';
import getStatePicklistValues from '@salesforce/apex/APFS_StateDistrictUtilityController.fetchSpecificStates';
import getDistrictPicklistValues from '@salesforce/apex/APFS_StateDistrictUtilityController.getSpecificDistrictPicklistValues';
import getBlockPicklistValues from '@salesforce/apex/APFS_StateDistrictUtilityController.getBlockPicklistValues';
import getSchoolsOrBoard from '@salesforce/apex/APFS_StateDistrictUtilityController.getSchoolsOrBoard';
import getStatePicklistValuesProfile from '@salesforce/apex/APFS_StateDistrictUtilityController.getStatePicklistValues';
import getDistrictPicklistValuesForProfile from '@salesforce/apex/APFS_StateDistrictUtilityController.getDistrictPicklistValues';
import getStatePicklistValuesForPatner from '@salesforce/apex/APFS_RefferalStatesandOrg.getStatePicklistValues';
import getOrganizationPicklistValues from '@salesforce/apex/APFS_RefferalStatesandOrg.getOrganizationPicklistValues';
import ApplicationEditPermissionProfiles from '@salesforce/label/c.Application_Edit_Permission';
import apfsCoDocMessagingChannel from "@salesforce/messageChannel/apfsCoDocMessagingChannel__c";
import fetchDocumentsByType from '@salesforce/apex/APFS_ContactDocumentsController.fetchprofileDocumentsByType';
const FIELDS = ['Application__c.Application_Review_Comment__c',
    'Application__c.Contact__r.Is_Aadhaar_Available__c',
    'Application__c.Contact__r.Aadhaar_Number__c',
    'Application__c.Contact__r.Class_Twelve_Pass_Percentage__c',
    'Application__c.Contact__r.Class_Ten_Pass_Percentage__c',
    'Application__c.Contact__r.Class_Eight_Pass_Percentage__c',
    'Application__c.Contact__r.FirstName',
    'Application__c.Contact__r.LastName',
    'Application__c.Application_Internal_Status__c',
    'Application__c.Contact__r.Category__c',
    'Application__c.Contact__r.Other_Category__c',
    'Application__c.Contact__r.Type_Of_Disablity__c',
    'Application__c.Contact__r.Other_Disability_Type__c',
    'Application__c.Contact__r.MobilePhone',
    'Application__c.Contact__r.Email',
    'Application__c.Contact__r.State__c',
    'Application__c.Contact__r.District__c',
    'Application__c.Contact__r.Birthdate',
    'Application__c.Contact__r.GenderIdentity',
    'Application__c.Contact__r.Full_Address__c',
    'Application__c.Contact__r.Full_Address_Pin_Code__c',
    'Application__c.Contact__r.Specially_Abled__c',
    'Application__c.Contact__r.Community_Name__c',
    'Application__c.Contact__r.Father_Full_Name__c',
    'Application__c.Contact__r.Family_Income_Per_Year__c',
    'Application__c.Contact__r.Religion__c',
    'Application__c.Contact__r.Other_Religion__c',
    'Application__c.Contact__r.Current_Family_Status__c',
    'Application__c.Contact__r.Other_Current_Family_Status__c',
    'Application__c.Contact__r.Mother_Full_Name__c',
    'Application__c.Contact__r.Referred_By_APF_Or_Partners__c',
    'Application__c.Contact__r.Referral_Partner_State__c',
    'Application__c.Contact__r.Referral_Full_Name__c',
    'Application__c.Contact__r.Referral_Partner_Name__c',
    'Application__c.Contact__r.Class_Eight_Year_Of_Passing__c',
    'Application__c.Contact__r.Class_Eight_Education_Mode__c',
    'Application__c.Contact__r.Class_Eight_Exam_Centre_State__c',
    'Application__c.Contact__r.Class_Eight_Exam_Centre_District__c',
    'Application__c.Contact__r.Class_Eight_Exam_Center_Block__c',
    'Application__c.Contact__r.Class_Eight_Exam_Centre_Pincode__c',
    'Application__c.Contact__r.Class_Eight_Name_Of_School__c',
    'Application__c.Contact__r.Class_Eight_Other_Name_Of_School__c',
    'Application__c.Contact__r.Class_Eight_Board_Name__c',
    'Application__c.Contact__r.Class_Eight_Other_Board_Name__c',
    'Application__c.Contact__r.Class_Ten_Year_Of_Passing__c',
    'Application__c.Contact__r.Class_Ten_Education_Mode__c',
    'Application__c.Contact__r.Class_Ten_Exam_Centre_State__c',
    'Application__c.Contact__r.Class_Ten_Exam_Centre_District__c',
    'Application__c.Contact__r.Class_Ten_Exam_Center_Block__c',
    'Application__c.Contact__r.Class_Ten_Exam_Centre_Pincode__c',
    'Application__c.Contact__r.Class_Ten_Rollno__c',
    'Application__c.Contact__r.Class_Twelve_Rollno__c',
    'Application__c.Contact__r.Class_Ten_Name_Of_School__c',
    'Application__c.Contact__r.Class_Ten_Other_Name_Of_School__c',
    'Application__c.Contact__r.Class_Ten_Board_Name__c',
    'Application__c.Contact__r.Class_Ten_Other_Board_Name__c',
    'Application__c.Contact__r.Class_Twelve_Education_Mode__c',
    'Application__c.Contact__r.Class_Twelve_Year_Of_Passing__c',
    'Application__c.Contact__r.Class_Twelve_Exam_Centre_State__c',
    'Application__c.Contact__r.Class_Twelve_Exam_Centre_District__c',
    'Application__c.Contact__r.Class_Twelve_Exam_Center_Block__c',
    'Application__c.Contact__r.Class_Twelve_Exam_Centre_Pincode__c',
    'Application__c.Contact__r.Class_Twelve_Name_Of_School__c',
    'Application__c.Contact__r.Class_Twelve_Other_Name_Of_School__c',
    'Application__c.Contact__r.Class_Twelve_Board_Name__c',
    'Application__c.Contact__r.Class_Twelve_Other_Board_Name__c',
    'Application__c.Contact__r.Is_Profile_Complete__c',
    'Application__c.Contact__r.Is_Education_Details_Completed__c',
    'Application__c.Contact__r.Is_My_Referral_Details_Completed__c',
    'Application__c.Contact__r.Is_Socio_Economic_Details_Completed__c'
];
export default class ApfsCoApplicationVerifier extends NavigationMixin(LightningElement) {
    @api recordId;
    @api sObjectContact = 'Contact';
    @api sObjectAdmission = 'Admission__c';
    messageContext = createMessageContext();
    firstName;
    lastName;
    selfPhoto;
    aadhaarNo;
    isAadharAvailable;
    mobilePhone;
    email;
    state;
    district;
    birthDay;
    gender;
    fullAddress;
    fullAddressPinCode;
    OverAllReview;
    ReviewOld;
    //Referral
    referredByAPFOrPartners;
    referralPartnerState;
    referralFullName;
    referralPartnerName;
    //class12
    class12percentage;
    class12EducationMode;
    class12YearOfPassing;
    class12YearOfAppearing;
    class12ExamState;
    class12ExamDistrict;
    class12ExamBlock;
    class12ExamCentrePincode;
    class12SchoolName;
    class12otherSchoolName;
    class12BoardName;
    class12OtherBoardName;
    //Class10
    class10percentage;
    class10YearOfPassing;
    class10EducationMode;
    class10ExamState;
    class10ExamDistrict;
    class10ExamBlock;
    class10ExamCentrePincode;
    class10Rollno;
    class12Rollno;
    class10SchoolName;
    class10otherSchoolName;
    class10BoardName;
    class10OtherBoardName;
    // Class8
    class8percentage;
    class8YearOfPassing;
    class8EducationMode;
    class8ExamState;
    class8ExamDistrict;
    class8ExamBlock;
    class8ExamCentrePincode;
    class8SchoolName;
    class8otherSchoolName;
    class8BoardName;
    isOtherClass8BoardName;
    disablity;
    otherDisablity;
    category;
    contactId;
    collegeName;
    bankName;
    commentValue = '';
    resumbisionCommentValue = '';
    applicationInternalStatus ='';
    constantAppInternalStatus ='';
    applicationInternalStatusForFile='';
    @track schoolManagementType8;
    @track schoolManagementType10;
    @track schoolManagementType12;
    @track instituteManagement;
    @track recordTypeId;
    @track contactRecordTypeId;
    @track documentsVisibilityPopup=false;
    @track isProfileCompleted = false;
    @track isEducationCompleted = false;
    @track isReferralCompleted = false;
    @track isScocialEconomicCompleted = false;
    @track recordEditPermission = false;
    @track commentVisibilityPopup = false;
    @track varificationButtonVisibilty = true;
    @track varificationClearPopup = false;
    @track buttonDisable = false;
    @track notSelectedDisable = false;
    @track isRecordEditMode = false;
    @track displayRejectedReason = false;
    @track commentInputVisibility = false;
    @track isOverAllCommentEditMode = false;
    @track referredByPartner = false;
    @track isClass8ModeOfEduRegular = false;
    @track isClass10ModeOfEduRegular = false;
    @track isClass12ModeOfEduRegular = false;
    @track visbleOtherCategory = false;
    @track isRequiredFieldMissing =false;
    @track isValid = true;
    @track class8SchoolOthers = false;
    @track class8BoardOthers = false;
    @track class10SchoolOthers = false;
    @track class10BoardOthers = false;
    @track class12SchoolOthers = false;
    @track class12BoardOthers = false;
    @track isOtherDisability = false;
    @track isOtherReligion = false;
    @track displayAdmission = false;
    @track isSpeciallyAbled = false;
    @track socioCastVisiblity = false;
    @track socioDisVisiblity = false;
    @track resumbisionComment = false;
    @track socioCastFiles = [];
    @track missingDocuments =[];
    @track updatedAdmissions = {};
    @track picklistOptions = [];
    @track onHoldOptions = [];
    @track districtsOptions8 = [];
    @track districtsOptions10 = [];
    @track districtsOptions12 = [];
    @track districtsOptionsProfile =[];
    @track filteredBlockOptions8 = []
    @track filteredBlockOptions10 = []
    @track filteredBlockOptions12 = []
    @track selectedStateId = [];
    @track genderModeOptions = [];
    @track speciallyAbledOptions = [];
    @track religionOptions = [];
    @track disablitiyOption =[];
    @track categoryOptions =[];
    @track familyIncomeOptions = [];
    @track isReferredOption =[];
    @track class8BoardOptions =[];
    @track class10BoardOptions =[];
    @track class12BoardOptions =[];
    @track parentalStatusOption =[];
    @track partnerStateOptions=[];
    @track statesOptionsProfile=[];
    @track organizationOptions =[];
    @track courseTypeOptions =[];
    @track yearOfStudyOptions =[];
    @track courseCategoryOptions =[];
    @track courseDurationInYearOptions =[];
    @track courseSystemOptions =[];
    @track districtsOptionsAdmission =[];
    applicationFiles = []; 
    selectedFiles = [];
    @track admissions = [];
    @track admission ={};
    @track unverifiedFiles=[];
    @track rejectedFiles=[];
    selectedSpeciallyAbledValue = '';
    selectedReligionValue = '';
    statesOptions = [];
    selectedRejectedReasonValue = '';
    speciallyAbled;
    communityName;
    otherCategory;
    fatherFullName;
    familyIncomePerYear;
    religion;
    otherReligion;
    currentFamilyStatus;
    otherCurrentFamilyStatus;
    motherFullName;
    userProfileName;
    columns = [
        { label: 'File Name', fieldName: 'fileName', type: 'text' },
        { label: 'Document Type', fieldName: 'documentType', type: 'text' },
        { label: 'Status', fieldName: 'applicantDocumentStatus', type: 'text' },
        { label: 'Comments', fieldName: 'comment', type: 'text' }
        ];
    @track columnsMissingDoc = [
        { label: 'Document Type', fieldName: 'documentType', type: 'text' }
    ];
    educationModeOptions = [
        { label: 'Regular', value: 'Regular' },
        { label: 'Distance', value: 'Distance' }
    ];

    defaultProfilePhotoUrl =`${SR_APFS}/SR_APFS/Icons/user-icon.jpg`;

    connectedCallback(){
        this.subscribeMessage();
        this.fetchPicklistValues(this.sObjectContact,this.contactFieldApiNames);
        this.fetchPicklistValues(this.sObjectAdmission,this.admissionFieldApiName)
        this.loadMissingDocuments();
        this.loadExistingProfilePhoto();
    }
    async loadExistingProfilePhoto() {
        try {
            const DocumentWrapper = await fetchDocumentsByType({ documentType: 'Self Photo',applicationId:this.recordId});
            if (DocumentWrapper && DocumentWrapper.length > 0) {
                const contentDocumentId = DocumentWrapper[0].contentDocumentId;
                this.defaultProfilePhotoUrl = `/sfc/servlet.shepherd/document/download/${contentDocumentId}`;
            }
            else{
                this.defaultProfilePhotoUrl =`${SR_APFS}/SR_APFS/Icons/user-icon.jpg`;   
            }
        } catch (error) {  
            this.defaultProfilePhotoUrl =`${SR_APFS}/SR_APFS/Icons/user-icon.jpg`;   
          }
    }

    @api contactFieldApiNames = ['Specially_Abled__c', 'Religion__c','Family_Income_Per_Year__c','GenderIdentity','Referred_By_APF_Or_Partners__c','Class_Eight_Board_Name__c','Class_Ten_Board_Name__c','Class_Twelve_Board_Name__c','Current_Family_Status__c','Type_Of_Disablity__c','Category__c'];
    @api admissionFieldApiName = ['Course_Type__c','Course_Year_Of_Studying__c','Course_Start_Date__c','Course_Category__c','Course_Duration_In_Years__c','Course_System__c'];
    optionsMap = {'Specially_Abled__c': 'speciallyAbledOptions','Religion__c': 'religionOptions','Family_Income_Per_Year__c': 'familyIncomeOptions','GenderIdentity': 'genderModeOptions','Referred_By_APF_Or_Partners__c': 'isReferredOption','Class_Eight_Board_Name__c': 'class8BoardOptions','Class_Ten_Board_Name__c': 'class10BoardOptions','Class_Twelve_Board_Name__c': 'class12BoardOptions','Current_Family_Status__c': 'parentalStatusOption','Type_Of_Disablity__c' : 'disablitiyOption','Category__c' : 'categoryOptions','Course_Type__c': 'courseTypeOptions','Course_Year_Of_Studying__c': 'yearOfStudyOptions','Course_Category__c': 'courseCategoryOptions','Course_Duration_In_Years__c': 'courseDurationInYearOptions','Course_System__c': 'courseSystemOptions'};
    fetchPicklistValues(sObjectTypeName,fieldApiNames) {
        getDynamicPicklistValues({ sObjectTypeName: sObjectTypeName, fieldApiNames: fieldApiNames })
            .then((result) => {
                for (let fieldApiName in this.optionsMap) {
                    if (result[fieldApiName]) {
                        this[this.optionsMap[fieldApiName]] = result[fieldApiName].map(value => {
                            return { label: value, value };
                        });
                    }
                }
            })
            .catch((error) => {
            this.showToast('Error',error.body.message, 'error');
            });
    }
    @wire(getCurrentUserProfileName)
    wiredProfileName({ error, data }) {
        if (data) {
            this.userProfileName = data;
            const adminProfilesArray = ApplicationEditPermissionProfiles.split(',');
            if (adminProfilesArray.includes(this.userProfileName.trim())) { 
                this.recordEditPermission = true;}
        } else if (error) {
            this.showToast('Error',error.body.message, 'error');
        }
    }
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredApplication(result) {
        this.loadStatePicklistValues()
            .then(() => {
                if (result.data) {
                    this.class12percentage = result.data?.fields?.Contact__r?.value?.fields?.Class_Twelve_Pass_Percentage__c?.value;
                    this.class10percentage = result.data?.fields?.Contact__r?.value?.fields?.Class_Ten_Pass_Percentage__c?.value;
                    this.class8percentage = result.data?.fields?.Contact__r?.value?.fields?.Class_Eight_Pass_Percentage__c?.value;
                    this.firstName = result.data.fields.Contact__r.value.fields.FirstName.value||'';
                    this.lastName = result.data.fields.Contact__r.value.fields.LastName.value||'';
                    this.selfPhoto = `${this.firstName} ${this.lastName}`;
                    this.aadhaarNo = result.data?.fields.Contact__r.value.fields.Aadhaar_Number__c.value;
                    this.isAadharAvailable = result.data?.fields.Contact__r.value.fields.Is_Aadhaar_Available__c.value;
                    this.email = result.data?.fields?.Contact__r?.value?.fields?.Email?.value;
                    this.mobilePhone = result.data?.fields?.Contact__r?.value?.fields?.MobilePhone?.value;
                    this.state = result.data?.fields?.Contact__r?.value?.fields?.State__c?.value;
                    this.loadStatePicklistValuesForProfile()
                        .then(() => { 
                            this.state = result.data?.fields?.Contact__r?.value?.fields?.State__c?.value;
                            const stateOption = this.statesOptionsProfile.find(option => option.value === this.state);
                            this.selectedStateId = stateOption ? stateOption.Id : '';
                            if (this.selectedStateId) {
                                const name = 'Profile';
                                return this.loadDistrictPicklistValuesForProfile(this.selectedStateId,name);
                            }
                        })
                        .then(() => {
                            this.district = result.data?.fields?.Contact__r?.value?.fields?.District__c?.value;
                        })
                        .catch(error => {
                        });
                    this.birthDay = result.data?.fields?.Contact__r?.value?.fields?.Birthdate?.value;
                    this.gender = result.data?.fields?.Contact__r?.value?.fields?.GenderIdentity?.value;
                    this.fullAddress = result.data?.fields?.Contact__r?.value?.fields?.Full_Address__c?.value;
                    this.fullAddressPinCode = result.data?.fields?.Contact__r?.value?.fields?.Full_Address_Pin_Code__c?.value;
                    this.category = result.data?.fields?.Contact__r?.value?.fields?.Category__c?.value;
                    if(this.category==='Others'){
                        this.visbleOtherCategory = true;
                    }
                    this.otherCategory = result.data?.fields?.Contact__r?.value?.fields?.Other_Category__c?.value;
                    this.isProfileCompleted = !!result.data?.fields?.Contact__r?.value?.fields?.Is_Profile_Complete__c?.value;
                    this.isEducationCompleted = !!result.data?.fields?.Contact__r?.value?.fields?.Is_Education_Details_Completed__c?.value;
                    this.isReferralCompleted = !!result.data?.fields?.Contact__r?.value?.fields?.Is_My_Referral_Details_Completed__c?.value;
                    this.isScocialEconomicCompleted = !!result.data?.fields?.Contact__r?.value?.fields?.Is_Socio_Economic_Details_Completed__c?.value;
                    this.disablity = result.data?.fields?.Contact__r?.value?.fields?.Type_Of_Disablity__c?.value;
                    if(this.disablity==='Others'){
                        this.isOtherDisability = true;
                        this.otherDisablity = result.data?.fields?.Contact__r?.value?.fields?.Other_Disability_Type__c?.value;
                    }
                    this.OverAllReview = result.data?.fields?.Application_Review_Comment__c?.value;
                    this.ReviewOld = this.OverAllReview;
                    this.applicationInternalStatus = result.data?.fields?.Application_Internal_Status__c?.value;
                    this.constantAppInternalStatus = this.applicationInternalStatus;
                    this.applicationInternalStatusForFile = result.data?.fields?.Application_Internal_Status__c?.value;
                    if(this.applicationInternalStatus==='Verification Cleared'){
                        this.notSelectedDisable = true;
                        this.buttonDisable = true;
                    }else if(this.applicationInternalStatus==='Not Selected'){
                        this.buttonDisable = true;
                    }else{
                        this.buttonDisable = false;
                    }
                    this.contactId = result.data?.fields.Contact__r.value.id;
                    //Social
                    this.speciallyAbled = result.data?.fields?.Contact__r?.value?.fields?.Specially_Abled__c?.value;
                    if(this.speciallyAbled==='Yes'){
                        this.isSpeciallyAbled = true;
                    }
                    this.communityName = result.data?.fields?.Contact__r?.value?.fields?.Community_Name__c?.value;
                    this.fatherFullName = result.data?.fields?.Contact__r?.value?.fields?.Father_Full_Name__c?.value;
                    this.familyIncomePerYear = result.data?.fields?.Contact__r?.value?.fields?.Family_Income_Per_Year__c?.value;
                    this.religion = result.data?.fields?.Contact__r?.value?.fields?.Religion__c?.value;
                    if(this.religion === 'Others'){
                        this.isOtherReligion = true;
                        this.otherReligion = result.data?.fields?.Contact__r?.value?.fields?.Other_Religion__c?.value;
                    }
                    this.currentFamilyStatus = result.data?.fields?.Contact__r?.value?.fields?.Current_Family_Status__c?.value;
                    this.otherCurrentFamilyStatus = result.data?.fields?.Contact__r?.value?.fields?.Other_Current_Family_Status__c?.value;
                    this.motherFullName = result.data?.fields?.Contact__r?.value?.fields?.Mother_Full_Name__c?.value;
                    //Referal
                    this.referredByAPFOrPartners = result.data?.fields?.Contact__r?.value?.fields?.Referred_By_APF_Or_Partners__c?.value;
                    if (this.referredByAPFOrPartners==='Yes'){
                        this.referredByPartner = true;
                    }
                    this.referralFullName = result.data?.fields?.Contact__r?.value?.fields?.Referral_Full_Name__c?.value;
                    this.loadStatePicklistValuesForPartner()
                        .then(() => { 
                            this.referralPartnerState = result.data?.fields?.Contact__r?.value?.fields?.Referral_Partner_State__c?.value;
                            const stateOption = this.partnerStateOptions.find(option => option.value === this.referralPartnerState);
                            this.selectedStateId = stateOption ? stateOption.Id : ''; 
                                if(this.selectedStateId){
                                    return this.loadPartnerName(this.selectedStateId);
                                }
                            })
                            .then(() => {
                                this.referralPartnerName = result.data?.fields?.Contact__r?.value?.fields?.Referral_Partner_Name__c?.value;
                            })
                            .catch(error => {
                            });                                        
                    //Class8
                    this.class8YearOfPassing = result.data?.fields?.Contact__r?.value?.fields?.Class_Eight_Year_Of_Passing__c?.value;
                    this.class8EducationMode = result.data?.fields?.Contact__r?.value?.fields?.Class_Eight_Education_Mode__c?.value;
                    if (this.class8EducationMode=='Regular'){
                        this.isClass8ModeOfEduRegular=true;
                    }
                    this.class8ExamState = result.data?.fields?.Contact__r?.value?.fields?.Class_Eight_Exam_Centre_State__c?.value;
                    if (this.class8ExamState) {
                        const stateOption = this.statesOptions.find(option => option.value === this.class8ExamState);
                        this.selectedStateId = stateOption ? stateOption.Id : '';
                        if (this.selectedStateId) {
                            this.loadDistrictPicklistValues(this.selectedStateId, 8)
                                .then(() => {
                                    this.class8ExamDistrict = result.data?.fields?.Contact__r?.value?.fields?.Class_Eight_Exam_Centre_District__c?.value;
                                    if (this.class8ExamDistrict) {
                                        if(this.isDisableAcademicAllFields === false){
                                            this.isState8Selected = false;
                                        }
                                        const distOption = this.districtsOptions8.find(option => option.value === this.class8ExamDistrict);
                                        const selectedDistrictId = distOption ? distOption.Id : '';
                                        if (selectedDistrictId) {
                                            this.loadBlockPicklistValues(selectedDistrictId, 8)
                                                .then(() => {
                                                    this.class8ExamBlock = result.data?.fields?.Contact__r?.value?.fields?.Class_Eight_Exam_Center_Block__c?.value;
                                                    if(this.isDisableAcademicAllFields === false){
                                                        this.isDistrict8Selected = false;
                                                    }
                                                    this.class8SchoolName = result.data?.fields?.Contact__r?.value?.fields?.Class_Eight_Name_Of_School__c?.value;
                                                    if (this.class8SchoolName) {
                                                        const classNumber = 8;
                                                        this.loadSchoolPicklistValues(this.class8ExamState, this.class8ExamDistrict, this.class8ExamBlock, classNumber);
                                                        if(this.isDisableAcademicAllFields === false){
                                                            this.Isclass8SchoolName = false;
                                                        }
                                                        if(this.class8SchoolName!='Other'){
                                                            const classNumber = 8;
                                                            this.getSchoolManagementType(this.class8SchoolName,classNumber);
                                                        }
                                                        this.class8SchoolOthers = this.class8SchoolName === 'Others';
                                                    }
                                                });
                                        }
                                    }
                                });
                        }
                    }
                    this.class8ExamCentrePincode = result.data?.fields?.Contact__r?.value?.fields?.Class_Eight_Exam_Centre_Pincode__c?.value;
                    this.class8otherSchoolName = result.data?.fields?.Contact__r?.value?.fields?.Class_Eight_Other_Name_Of_School__c?.value;
                    this.class8BoardName = result.data?.fields?.Contact__r?.value?.fields?.Class_Eight_Board_Name__c?.value;
                    this.class8BoardOthers = this.class8BoardName === 'Others';
                    this.isOtherClass8BoardName = result.data?.fields?.Contact__r?.value?.fields?.Class_Eight_Other_Board_Name__c?.value;
                    //Class10
                    this.class10YearOfPassing = result.data?.fields?.Contact__r?.value?.fields?.Class_Ten_Year_Of_Passing__c?.value;
                    this.class10EducationMode = result.data?.fields?.Contact__r?.value?.fields?.Class_Ten_Education_Mode__c?.value;
                    if (this.class10EducationMode=='Regular'){
                        this.isClass10ModeOfEduRegular=true;
                    }
                    this.class10ExamState = result.data?.fields?.Contact__r?.value?.fields?.Class_Ten_Exam_Centre_State__c?.value;
                    if (this.class10ExamState) {
                        const stateOption = this.statesOptions.find(option => option.value === this.class10ExamState);
                        this.selectedStateId = stateOption ? stateOption.Id : '';
                        if (this.selectedStateId) {
                            this.loadDistrictPicklistValues(this.selectedStateId, 10)
                                .then(() => {
                                    this.class10ExamDistrict = result.data?.fields?.Contact__r?.value?.fields?.Class_Ten_Exam_Centre_District__c?.value;
                                    if (this.class10ExamDistrict) {
                                        const distOption = this.districtsOptions10.find(option => option.value === this.class10ExamDistrict);
                                        const selectedDistrictId = distOption ? distOption.Id : '';
                                        if (selectedDistrictId) {
                                            this.loadBlockPicklistValues(selectedDistrictId, 10)
                                                .then(() => {
                                                    this.class10ExamBlock = result.data?.fields?.Contact__r?.value?.fields?.Class_Ten_Exam_Center_Block__c?.value;
                                                    this.class10SchoolName = result.data?.fields?.Contact__r?.value?.fields?.Class_Ten_Name_Of_School__c?.value;
                                                    if (this.class10SchoolName) {
                                                        const classNumber = 10;
                                                        this.loadSchoolPicklistValues(this.class10ExamState, this.class10ExamDistrict, this.class10ExamBlock, classNumber);
                                                        if(this.isDisableAcademicAllFields === false){
                                                            this.Isclass10SchoolName = false;
                                                        }
                                                        if(this.class10SchoolName!='Other'){
                                                            const classNumber = 10;
                                                            this.getSchoolManagementType(this.class10SchoolName,classNumber);
                                                        }
                                                        this.class10SchoolOthers = this.class10SchoolName === 'Others';
                                                    }
                                                });
                                        }
                                    }
                                });
                        }
                    }
                    this.class10ExamCentrePincode = result.data?.fields?.Contact__r?.value?.fields?.Class_Ten_Exam_Centre_Pincode__c?.value;
                    this.class10Rollno = result.data?.fields?.Contact__r?.value?.fields?.Class_Ten_Rollno__c?.value;
                    this.class12Rollno = result.data?.fields?.Contact__r?.value?.fields?.Class_Twelve_Rollno__c?.value;
                    this.class10otherSchoolName = result.data?.fields?.Contact__r?.value?.fields?.Class_Ten_Other_Name_Of_School__c?.value;
                    this.class10BoardName = result.data?.fields?.Contact__r?.value?.fields?.Class_Ten_Board_Name__c?.value;
                    this.class10BoardOthers = this.class10BoardName === 'Others';
                    this.class10OtherBoardName = result.data?.fields?.Contact__r?.value?.fields?.Class_Ten_Other_Board_Name__c?.value;
                    // Class12
                    this.class12EducationMode = result.data?.fields?.Contact__r?.value?.fields?.Class_Twelve_Education_Mode__c?.value;
                    if (this.class12EducationMode=='Regular'){
                        this.isClass12ModeOfEduRegular=true;
                    }
                    this.class12YearOfPassing = result.data?.fields?.Contact__r?.value?.fields?.Class_Twelve_Year_Of_Passing__c?.value;
                    this.class12ExamState = result.data?.fields?.Contact__r?.value?.fields?.Class_Twelve_Exam_Centre_State__c?.value;
                    if (this.class12ExamState) {
                        const stateOption = this.statesOptions.find(option => option.value === this.class12ExamState);
                        this.selectedStateId = stateOption ? stateOption.Id : '';
                        if (this.selectedStateId) {
                            this.loadDistrictPicklistValues(this.selectedStateId, 12)
                                .then(() => {
                                    this.class12ExamDistrict = result.data?.fields?.Contact__r?.value?.fields?.Class_Twelve_Exam_Centre_District__c?.value;
                                    if (this.class12ExamDistrict) {
                                        const distOption = this.districtsOptions12.find(option => option.value === this.class12ExamDistrict);
                                        const selectedDistrictId = distOption ? distOption.Id : '';
                                        if (selectedDistrictId) {
                                            this.loadBlockPicklistValues(selectedDistrictId, 12)
                                                .then(() => {
                                                    this.class12ExamBlock = result.data?.fields?.Contact__r?.value?.fields?.Class_Twelve_Exam_Center_Block__c?.value;
                                                    this.class12SchoolName = result.data?.fields?.Contact__r?.value?.fields?.Class_Twelve_Name_Of_School__c?.value;
                                                    if (this.class12SchoolName) {
                                                        const classNumber = 12;
                                                        this.loadSchoolPicklistValues(this.class12ExamState, this.class12ExamDistrict, this.class12ExamBlock, classNumber);
                                                        this.class12SchoolOthers = this.class12SchoolName === 'Others';
                                                        if(this.class12SchoolName!='Other'){
                                                            const classNumber = 12;
                                                            this.getSchoolManagementType(this.class12SchoolName,classNumber);
                                                        }
                                                    }
                                                });
                                        }
                                    }
                                });
                        }
                    }
                    this.class12ExamBlock = result.data?.fields?.Contact__r?.value?.fields?.Class_Twelve_Exam_Center_Block__c?.value;
                    this.class12ExamCentrePincode = result.data?.fields?.Contact__r?.value?.fields?.Class_Twelve_Exam_Centre_Pincode__c?.value;
                    this.class12otherSchoolName = result.data?.fields?.Contact__r?.value?.fields?.Class_Twelve_Other_Name_Of_School__c?.value;
                    this.class12BoardName = result.data?.fields?.Contact__r?.value?.fields?.Class_Twelve_Board_Name__c?.value;
                    this.class12BoardOthers = this.class12BoardName === 'Others';
                    this.class12OtherBoardName = result.data?.fields?.Contact__r?.value?.fields?.Class_Twelve_Other_Board_Name__c?.value;
                    this.fetchAdmissionRecords();
                } else if (result.error) {
                    this.showToast('Error', this.error.body.message || 'Failed to retrieve uploaded documents.', 'error');
                }
            })
            .catch((error) => {
                this.showToast('Error',error.body.message?error.body.message: 'Failed to load contact data', 'error');
            });
    }
    @wire(getObjectInfo, { objectApiName: APPLICATION_STATUS_COMMENT_OBJECT })
    objectInternalInfo({ error, data }) {
        if (data) {
            this.recordTypeId =data.defaultRecordTypeId;
        } else if (error) {
            this.showToast('Error',error.body.message, 'error');
        }
    }
    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: APPLICATION_REJECTED_STATUS })
    wiredInternalPicklistValues({ error, data }) {
        if (data) {
            this.picklistOptions = data.values; 
        } else if (error) {
            this.showToast('Error',error.body.message, 'error');
        }
    }
    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: APPLICATION_ONHOLD_STATUS })
    wiredOnHoldValues({ error, data }) {
        if (data) {
            this.onHoldOptions = data.values; 
        } else if (error) {
            this.showToast('Error',error.body.message, 'error');
        }
    }
    fetchAdmissionRecords() {
        getAdmissionRecords({ contactId: this.contactId, applicationId: this.recordId })
            .then(result => {
                if (result && Array.isArray(result) && result.length > 0) {
                    this.admissions = result;
                    this.displayAdmission=true;
                    const state = this.admissions[0].Institute_State__c;
                    const selectedOption = this.statesOptionsProfile.find(option => option.value === state);
                    if(selectedOption){
                        this.selectedStateId = selectedOption.Id;
                    }
                    if(this.selectedStateId){
                        const name = 'Admission';
                        return this.loadDistrictPicklistValuesForProfile(this.selectedStateId,name);
                    }
                    const instituteName = this.admissions[0].Name_Of_The_Institute__c;    
                    if (instituteName) {
                        this.loadInstituteManagement(instituteName);
                    }
                } else {
                    this.displayAdmission=false;
                    this.admissions = [];
                }
            })
            .catch(error => {
                this.displayAdmission=false;
                this.admissions = [];
                this.showToast('Error',error.body.message?error.body.message: 'Failed to load admission', 'error');
            });
    }
    
    @wire(getUploadedDocuments, { applicationId: '$recordId' })
    wiredDocuments(result) {
        this.wiredDocumentsResult = result;
        if (result.data) {
            const documentsList = result.data.documents;
            this.processFiles(documentsList);
        } else if (result.error) {
            this.showToast('Error', this.error.body.message || 'Failed to retrieve documents.', 'error');
        }
    }
    loadStatePicklistValuesForPartner() {
        return getStatePicklistValuesForPatner()
            .then(data => {
                this.partnerStateOptions = Object.keys(data).map(key => ({
                    Id: key,
                    label: data[key],
                    value: data[key]
                }));
            })
            .catch(error => {
                this.showToast('Error',error.body.message?error.body.message: 'Failed to load partner state', 'error');
            });
    }
    getSchoolManagementType(schoolName, classNumber) {
        if (schoolName === undefined || schoolName === null || schoolName === '' || schoolName === 'Others') {
            return;}
        getSchoolManagement({ schoolName: schoolName })
            .then(data => {
                if(classNumber ===8){
                    this.schoolManagementType8 = data[0].School_Management_Type__c;
                }else if(classNumber ===10){
                    this.schoolManagementType10 = data[0].School_Management_Type__c;
                }else if(classNumber ===12){
                    this.schoolManagementType12 = data[0].School_Management_Type__c;
                }else{
                    this.showToast('Error', error.body.message, 'error');
                }
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }
    loadInstituteManagement(instituteName) {
        if (instituteName === undefined || instituteName === null || instituteName === '' || instituteName === 'Others') {
            return; 
        }
        getInstituteManagement({ instituteName: instituteName})
            .then(data => {
                if (data && data.length > 0 && data[0].Institute_Management__c) {
                    this.instituteManagement = data[0].Institute_Management__c;
                }})
            .catch(error => {
                this.showToast('Error',error.body.message?error.body.message: 'Loading error institute management', 'error');
            });
    }
    
    async loadStatePicklistValues() {
        return getStatePicklistValues()
            .then((data) => {
                this.statesOptions = Object.keys(data).map((key) => ({
                    Id: key,
                    label: data[key],
                    value: data[key]
                }));
            })
            .catch((error) => {
                this.showToast('Error',error.body.message?error.body.message: 'Failed to load state picklist', 'error');
            });
    }
    loadStatePicklistValuesForProfile() {
        return getStatePicklistValuesProfile()
            .then((data) => {
                this.statesOptionsProfile = Object.keys(data).map((key) => ({
                    Id: key,
                    label: data[key],
                    value: data[key]
                }));
            })
            .catch((error) => {
                this.showToast('Error',error.body.message?error.body.message: 'Failed to load profile state', 'error');
            });
    }
    loadPartnerName(StateId) {
        if (StateId === undefined || StateId === null || StateId === '') {
            return; 
        }
        return getOrganizationPicklistValues({ stateId: StateId })
            .then(result => {
                this.organizationOptions = Object.keys(result).map(key => ({
                    Id:key,
                    label: result[key],
                    value: result[key]
                }));
                this.isLoading=false;
            })
            .catch(error => {
                this.isLoading=false;
                this.showToast('Error',error.body.message?error.body.message:'Error loading organization picklist', 'error');
            });
    }
    loadDistrictPicklistValuesForProfile(StateId,name) {
        if (StateId === undefined || StateId === null || StateId === '') {
            return; 
        }
        getDistrictPicklistValuesForProfile({ stateId: StateId })
            .then(result => {
                if (result && Object.keys(result).length > 0) {
                    const districtOptions = Object.keys(result).map(key => ({
                        Id: key,
                        label: result[key],
                        value: result[key]
                    }));
                    this[`districtsOptions${name}`] = districtOptions;
            }
            })
            .catch(error => {
                this.showToast('Error', error.message ? error.message : 'Something went wrong', 'error');
            });
    }
    loadDistrictPicklistValues(StateId, classNumber) {
        if (StateId === undefined || StateId === null || StateId === '') {
            return; 
        }
        return getDistrictPicklistValues({ stateId: StateId })  
            .then(result => {
                const districtOptions = Object.keys(result).map(key => ({
                    Id: key,
                    label: result[key],
                    value: result[key]
                }));
                this[`districtsOptions${classNumber}`] = districtOptions;
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
        }
    loadBlockPicklistValues(DistId, classNumber) {
        if (DistId === undefined || DistId === null || DistId === '') {
            return; 
        }
        return getBlockPicklistValues({ districtId: DistId })
                .then(result => {
                    const blockOptions = Object.keys(result).map(key => ({
                        Id: key,
                        label: result[key],
                        value: result[key]
                    }));
                    this[`filteredBlockOptions${classNumber}`] = blockOptions;
                })
                .catch(error => {
                });
        }
    loadSchoolPicklistValues(state, district, block, classNumber) {
        if (!state || !district || !block || !classNumber) {
            return;}
        getSchoolsOrBoard({ 
                state: state, 
                district: district, 
                block: block,
                className : classNumber 
            })
            .then(result => {
                const schoolOptions = result.map(school => ({
                    Id: school.Id,
                    label: school.School_Name__c,
                    value: school.School_Name__c
                }));
                schoolOptions.push({ label: 'Others', value: 'Others' });
                this[`filteredSchoolNameOptions${classNumber}`] = schoolOptions;
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
        }
    processFiles(data) {
        this.applicationFiles = [];
        data.forEach(file => {
            const isImage = this.isImage(file.FileExtension);
            const isPdf = this.isPdf(file.FileExtension);
            const fileDetails = {
                contactId: file.Contact__c,
                contentVersionId: file.Id,
                fileName: file.Title,
                contentDocumentUrl: this.getContentDocumentUrl(file.ContentDocumentId),
                contentDocumentId: file.ContentDocumentId,
                comment: file.Application_Document_Comment__c,
                applicationId: file.Application__c,
                applicantDocumentStatus: file.Applicant_Document_Status__c,
                documentType: file.Applicant_Document_Type__c,
                fileExtension: file.FileExtension,
                isImage: isImage,
                isPdf: isPdf,
                filePreviewUrl: this.getContentDocumentUrl(file.ContentDocumentId)
            };
            const validDocumentTypes = ['Self Photo', 'Aadhaar Card' , 'Class Eight Marks Card', 'Class Ten Marks Card', 'Class Twelve Marks Card', 'College Admission Proof', 'College Fee Receipt','Disability Certificate','Caste Certificate'];
            if (validDocumentTypes.includes(fileDetails.documentType)) {
                this.applicationFiles.push(fileDetails);
            }
        });
        this.rejectedFiles = this.applicationFiles.filter(file => file.applicantDocumentStatus === 'Rejected');
        this.socioCastFiles = this.applicationFiles.filter(file => file.documentType === 'Caste Certificate');
        if(this.socioCastFiles.length != 0){
            this.socioCastVisiblity = true;
        }
        this.socioDisFiles = this.applicationFiles.filter(file =>file.documentType === 'Disability Certificate');
        if(this.socioDisFiles.length != 0){
            this.socioDisVisiblity = true;
        }
    }
    getContentDocumentUrl(contentDocumentId) {
        return `/sfc/servlet.shepherd/document/download/${contentDocumentId}`;
    }
    get formattedBirthDay() {
        if (this.birthDay) {
            let dateObj = new Date(this.birthDay);
            let day = String(dateObj.getDate()).padStart(2, '0');
            let month = String(dateObj.getMonth() + 1).padStart(2, '0');
            let year = dateObj.getFullYear();
            return `${day}/${month}/${year}`;
        }
        return null;
    }
    handleClick(event) {
        const clickedLinkName = event.target.name;
        const applicationId = this.recordId;
        const isSpecialCase = clickedLinkName === 'Aadhaar Card' || clickedLinkName === 'Self Photo' || clickedLinkName === 'Class Eight Marks Card' || clickedLinkName === 'Class Ten Marks Card' || clickedLinkName === 'Class Twelve Marks Card' || clickedLinkName === 'Bank Cheque' || clickedLinkName === 'Disability Certificate' || clickedLinkName === 'Caste Certificate';
        const matchingFiles = this.applicationFiles.filter(f => 
            (isSpecialCase ? f.documentType === clickedLinkName : f.documentType === clickedLinkName && f.applicationId === applicationId)
        );
        if (matchingFiles.length > 0) {
            this.selectedFiles = matchingFiles.map(file => ({
                contentVersionId: file.contentVersionId,
                contentDocumentId: file.contentDocumentId,
                contactId: file.contactId,
                applicationId: file.applicationId,
                documentType: file.documentType,
                fileExtension: file.fileExtension,
                filePreviewUrl: file.contentDocumentUrl,
                applicantDocumentStatus: file.applicantDocumentStatus,
                applicationInternalStatus: this.applicationInternalStatusForFile
            }));
            this.publishMessage();
        } else {
            this.showToast('Error', `${clickedLinkName} file not found.`, 'error');
        }
    }
    publishMessage() {
        const message = {
            isOpen: true,
            files: this.selectedFiles,
            operationType: 'ApfsCoApplicationVerifier'
        };
        publish(this.messageContext, apfsCoDocMessagingChannel, message);
    }
    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }
    handleFieldChange(event) {
        const field = event.target.dataset.id;
        this[field] = event.target.value;
        const lastNameInput = this.template.querySelector('lightning-input[data-id="lastName"]');
        lastNameInput.setCustomValidity('');
        lastNameInput.reportValidity();   
        if (event.target.dataset.type === 'admission') {
            if (field === 'Institute_State__c') {
                const selectedOption = this.statesOptionsProfile.find(option => option.value === event.target.value);
                this.selectedStateId = selectedOption ? selectedOption.Id : null;    
                if (this.selectedStateId) {
                    const name = 'Admission';
                    this.loadDistrictPicklistValuesForProfile(this.selectedStateId, name);
                }
            }    
            const closestElement = event.target.closest('[data-key]');
            const admissionId = closestElement ? closestElement.dataset.key : null;
    
            if (admissionId) {
                if (!this.admission[admissionId]) {
                    this.admission[admissionId] = { Id: admissionId };
                }    
                this.admission[admissionId][field] = this[field];
            }
        }
    }
    handleChange(event){
        const field = event.target.dataset.id;
        this[field] = event.target.value;
        this.handleEducationChange(event);
        this.handleSchoolChange(event);
        this.handleBoardChange(event);
        this.handleStateChange(event);
        this.handleDistrictChange(event);
        this.handleBlockChange(event);
    }
    handleProfileStateChange(event){
        const selectedValue = event.detail.value;
        this.state = selectedValue;
        this.district ='';
        const selectedOption = this.statesOptionsProfile.find(option => option.value === selectedValue);
        this.selectedStateId = selectedOption.Id;
        const name = 'Profile';
        this.loadDistrictPicklistValuesForProfile(this.selectedStateId,name);
    }
    handlePartnerStateChange(event){
        const selectedValue = event.detail.value;
        this.referralPartnerState = selectedValue;
        const selectedOption = this.partnerStateOptions.find(option => option.value === selectedValue); 
        this.selectedStateId = selectedOption.Id;       
        this.loadPartnerName(this.selectedStateId);
    }
    handleEducationChange(event){
        const fieldName = event.target.name.trim();
        const ModeOfEducation = event.detail.value;
        const classNumber = this.extractClassNumber(fieldName);
        if (fieldName === `class${classNumber}ModeOfEducation` && ModeOfEducation ==='Regular') {
            this[`isClass${classNumber}ModeOfEduRegular`]=true;
        }else if(fieldName === `class${classNumber}ModeOfEducation` && ModeOfEducation !='Regular'){
            this[`isClass${classNumber}ModeOfEduRegular`]=false;
        }
    }
    handleSchoolChange(event){
        const fieldName = event.target.name.trim();
        const nameValue = event.detail.value;
        const classNumber = this.extractClassNumber(fieldName);
        if (fieldName === `class${classNumber}SchoolName` && nameValue ==='Others') {
            this[`class${classNumber}SchoolOthers`]=true;
        }else if(fieldName === `class${classNumber}SchoolName` && nameValue !='Others'){
            this[`class${classNumber}SchoolOthers`]=false;
        }
    }
    handleBoardChange(event){
        const fieldName = event.target.name.trim();
        const nameValue = event.detail.value;
        const classNumber = this.extractClassNumber(fieldName);
        if (fieldName === `class${classNumber}BoardName` && nameValue ==='Others') {
            this[`class${classNumber}BoardOthers`]=true;
        }else if(fieldName === `class${classNumber}BoardName` && nameValue !='Others'){
            this[`class${classNumber}BoardOthers`]=false;
        }
    }
    handleStateChange(event) {
        const fieldName = event.target.name.trim();
        const selectedValue = event.detail.value;
        const classNumber = this.extractClassNumber(fieldName);
        if (fieldName === `class${classNumber}ExamState`) {
            this[`class${classNumber}ExamDistrict`]=''
            this[`class${classNumber}ExamBlock`]=''
            this[`class${classNumber}SchoolName`]=''
            this[`class${classNumber}otherSchoolName`]=''  
            this[`class${classNumber}BoardName`]=''
            this[`otherClass${classNumber}BoardName`]=''
            this[`class${classNumber}ExamState`] = event.target.value;
            const selectedOption = this.statesOptions.find(option => option.value === selectedValue);
            this.selectedStateId = selectedOption.Id;
            this.loadDistrictPicklistValues(this.selectedStateId, classNumber);
            this[`isState${classNumber}Selected`] = false;
        }
    }
    handleDistrictChange(event) {
        const fieldName = event.target.name.trim();
        const selectedValue = event.detail.value;
        const classNumber = this.extractClassNumber(fieldName);
        if (fieldName === `class${classNumber}ExamDistrict`) {  
            this[`class${classNumber}ExamBlock`] =''
            this[`class${classNumber}SchoolName`]=''
            this[`class${classNumber}otherSchoolName`]=''
            this[`class${classNumber}BoardName`]=''
            this[`otherClass${classNumber}BoardName`]=''    
            this[`class${classNumber}ExamDistrict`] = event.target.value;
            const selectedOption = this[`districtsOptions${classNumber}`].find(option => option.value === selectedValue);
            this.selectedDistrictId = selectedOption.Id;
            this.loadBlockPicklistValues(this.selectedDistrictId, classNumber);
            this[`isDistrict${classNumber}Selected`] = false;
        }
    }
    handleBlockChange(event) {
        const fieldName = event.target.name.trim();
        const classNumber = this.extractClassNumber(fieldName);
        const selectedValue = event.detail.value;
        if (fieldName === `class${classNumber}ExamBlock`) {
            this[`class${classNumber}SchoolName`] = '';
            this[`class${classNumber}ExamBlock`] = selectedValue;
            this.selectedBlockName = this[`class${classNumber}ExamBlock`];
            this[`class${classNumber}BoardName`] = '';
            this[`otherClass${classNumber}BoardName`] = '';
            this[`otherClass${classNumber}BoardName`] = '';
            this[`class${classNumber}otherSchoolName`] = '';
            const selectedOption = this[`filteredBlockOptions${classNumber}`].find(option => option.value === selectedValue);
            const selectedExamBlockId = selectedOption.Id;
            const selectedStateValue = this[`class${classNumber}ExamState`];
            const selectedDistrictValue = this[`class${classNumber}ExamDistrict`];
            const selectedBlockValue = this[`class${classNumber}ExamBlock`];
            this.loadSchoolPicklistValues(selectedStateValue, selectedDistrictValue, selectedBlockValue, classNumber); 
        }
    }
    extractClassNumber(fieldName) {
        const match = fieldName.match(/\d+/);
        return match ? match[0] : null;
    }
    toggleEditMode() {
        this.isRecordEditMode = !this.isRecordEditMode;
        this.varificationButtonVisibilty = false;
    }
    enableOverallComment(){
        this.isOverAllCommentEditMode = !this.isOverAllCommentEditMode;
        this.varificationButtonVisibilty = false;
    }
    cancelEdit() {
        this.isRecordEditMode = false;
        this.varificationButtonVisibilty = true;
        location.reload();
    }
    async saveRecord() {
        const lastNameInput = this.template.querySelector('lightning-input[data-id="lastName"]');
        if (!this.lastName) {
            lastNameInput.setCustomValidity('Please complete this field.');
            lastNameInput.reportValidity();
            return; 
        }    
        const fields = {
            //Profile
            Id: this.contactId,
            FirstName : this.firstName,
            LastName : this.lastName,
            MobilePhone: this.mobilePhone,
            State__c: this.state,
            District__c: this.district,
            Aadhaar_Number__c : this.aadhaarNo,
            Aadhaar_Number__c: this.aadhaarNo,
            Email: this.email,
            Birthdate: this.birthDay,
            GenderIdentity: this.gender,
            Full_Address__c: this.fullAddress,
            Full_Address_Pin_Code__c: this.fullAddressPinCode,
            //Referal
            Referred_By_APF_Or_Partners__c: this.referredByAPFOrPartners,
            Referral_Partner_State__c: this.referralPartnerState,
            Referral_Full_Name__c: this.referralFullName,
            Referral_Partner_Name__c: this.referralPartnerName,
            //Social
            Category__c: this.category,
            Specially_Abled__c: this.speciallyAbled,
            Type_Of_Disablity__c :  this.disablity,
            Community_Name__c: this.communityName,
            Father_Full_Name__c: this.fatherFullName,
            Family_Income_Per_Year__c: this.familyIncomePerYear,
            Religion__c: this.religion,
            Other_Religion__c: this.otherReligion,
            Current_Family_Status__c: this.currentFamilyStatus,
            Other_Current_Family_Status__c: this.otherCurrentFamilyStatus,
            //Clas8
            Class_Eight_Year_Of_Passing__c: this.class8YearOfPassing,
            Class_Eight_Education_Mode__c: this.class8EducationMode,
            Class_Eight_Exam_Centre_State__c: this.class8ExamState,
            Class_Eight_Exam_Centre_District__c: this.class8ExamDistrict,
            Class_Eight_Exam_Center_Block__c: this.class8ExamBlock,
            Class_Eight_Exam_Centre_Pincode__c: this.class8ExamCentrePincode,
            Class_Eight_Name_Of_School__c: this.class8SchoolName,
            Class_Eight_Other_Name_Of_School__c: this.class8otherSchoolName,
            Class_Eight_Board_Name__c: this.class8BoardName,
            Class_Eight_Other_Board_Name__c: this.isOtherClass8BoardName,
            Class_Eight_Pass_Percentage__c: this.class8percentage,
            //Clas10
            Class_Ten_Year_Of_Passing__c: this.class10YearOfPassing,
            Class_Ten_Education_Mode__c: this.class10EducationMode,
            Class_Ten_Exam_Centre_State__c: this.class10ExamState,
            Class_Ten_Exam_Centre_District__c: this.class10ExamDistrict,
            Class_Ten_Exam_Center_Block__c: this.class10ExamBlock,
            Class_Ten_Exam_Centre_Pincode__c: this.class10ExamCentrePincode,
            Class_Ten_Name_Of_School__c: this.class10SchoolName,
            Class_Ten_Other_Name_Of_School__c: this.class10otherSchoolName,
            Class_Ten_Board_Name__c: this.class10BoardName,
            Class_Ten_Other_Board_Name__c: this.class10OtherBoardName,
            Class_Ten_Pass_Percentage__c: this.class10percentage,
            Class_Ten_Rollno__c: this.class10Rollno,
            //Clas12
            Class_Twelve_Education_Mode__c: this.class12EducationMode,
            Class_Twelve_Year_Of_Passing__c: this.class12YearOfPassing,
            Class_Twelve_Exam_Centre_State__c: this.class12ExamState,
            Class_Twelve_Exam_Centre_District__c: this.class12ExamDistrict,
            Class_Twelve_Exam_Center_Block__c: this.class12ExamBlock,
            Class_Twelve_Exam_Centre_Pincode__c: this.class12ExamCentrePincode,
            Class_Twelve_Name_Of_School__c: this.class12SchoolName,
            Class_Twelve_Other_Name_Of_School__c: this.class12otherSchoolName,
            Class_Twelve_Board_Name__c: this.class12BoardName,
            Class_Twelve_Other_Board_Name__c: this.class12OtherBoardName,
            Class_Twelve_Pass_Percentage__c: this.class12percentage,
            Class_Twelve_Rollno__c : this.class12Rollno
        };  
        const UpdateValid = await this.updateRecord(fields);
        if (UpdateValid) {
            this.updateRecord(fields);
            this.handleAdmissionUpdate() 
            this.isRecordEditMode = false;
            this.varificationButtonVisibilty = true;
        }
    }
    handleAdmissionUpdate() {
        const recordsToUpdate = Object.values(this.admission);
        if (recordsToUpdate.length > 0) {
            const promises = recordsToUpdate.map(record => {
                const recordInput = { fields: record };
                return updateRecord(recordInput);
            });
            Promise.all(promises)
                .then(() => {
                    this.admissions = [];
                    this.fetchAdmissionRecords();
                })
                .catch(error => {
                    this.showToast('error',  'An error occurred while updating admission', 'error');
                });
        } else {
        }
    }
    updateRecord(fields) {
        const recordInput = { fields };
        return updateRecord(recordInput)
            .then(() => {
                return true;
            })
            .catch(error => {
                let errorMessage = error.body?.message || 'Something went wrong';
                let duplicateFields = [];
                if (error.body?.output?.errors) {
                    const errors = error.body.output.errors;
                    for (let i = 0; i < errors.length; i++) {
                        if (errors[i].errorCode === 'DUPLICATE_VALUE') {
                            const duplicateValueMessage = errors[i].message;
                            const fieldMatch = duplicateValueMessage.match(/duplicate value found: ([\w_]+) duplicates/);
                            if (fieldMatch && fieldMatch[1]) {
                                const duplicateField = fieldMatch[1];
                                if (duplicateField === 'Class_Ten_Rollno__c') {
                                    duplicateFields.push('Class 10 Roll Number');
                                } if (duplicateField === 'Class_Twelve_Rollno__c') {
                                    duplicateFields.push('Class 12 Roll Number');
                                }
                            }
                        }
                    }
                    if (duplicateFields.length > 0) {
                        errorMessage = `Duplicate value found for: ${duplicateFields.join(' and ')}`;
                    }
                }    
                this.showToast('Error', errorMessage, 'error');    
                return false;
            });
    }
    isImage(fileExtension) {
        return ['jpg', 'jpeg', 'png'].includes(fileExtension.toLowerCase());
    }
    isPdf(fileExtension) {
        return fileExtension.toLowerCase() === 'pdf';
    }
    handleCommentChange(event){
        this.commentValue  = event.target.value;
    }
    handleOverallReviewCommentChange(event){
        this.OverAllReview  = event.target.value;
    }
    handleClickButton(event){
        const clickedButtonName = event.target.name;
        if(clickedButtonName === 'Application Document Needs Resubmission'){
            const isFormValid = this.validateRequiredFields('Resubmission'); 
            if (isFormValid) {
                this.applicationInternalStatus = 'Application Document Needs Resubmission';
                this.documentsVisibilityPopup=true;
            }
        }else if(clickedButtonName === 'VerificationClear'){
            const isFormValid = this.validateRequiredFields('verificationClear'); 
            if (isFormValid) {
                this.unverifiedFiles = this.applicationFiles.filter(file => file.applicantDocumentStatus !== 'Verified');
                if(this.admissions[0].Course_Year_Of_Studying__c>this.admissions[0].Course_Duration_In_Years__c ){
                    this.showToast('Error', 'The current year of study cannot be greater than the course duration.', 'error');
                }else if (this.unverifiedFiles.length > 0) {
                    this.showToast('Error', 'A few documents are still not verified.', 'error');
                }else if (this.missingDocuments.length>0) {
                    this.showToast('Error', 'A few documents are fully rejected.', 'error');
                } else {
                    this.applicationInternalStatus = 'Verification Cleared';
                    this.selectedRejectedReasonValue='';
                    this.commentValue='';
                    this.commentVisibilityPopup = true;
                    this.commentInputVisibility = true;
                }
            }
        }else if(clickedButtonName === 'FaceToFace'){
            const unverifiedOrRejectedFiles = this.applicationFiles.filter(file => file.applicantDocumentStatus !== 'Verified' && file.applicantDocumentStatus !== 'Rejected');
            if(unverifiedOrRejectedFiles.length > 0 ){
                this.showToast('Error', 'A few documents are still not verified or rejected.', 'error');
            }else {
            this.commentValue='';
            this.applicationInternalStatus = 'Face To Face';
            this.applicationExternalStatus = 'Face To Face';
            this.commentVisibilityPopup = true;
            this.commentInputVisibility = true;
            }
        }else if(clickedButtonName === 'NotSelected'){
            const unverifiedOrRejectedFiles = this.applicationFiles.filter(file => file.applicantDocumentStatus !== 'Verified' && file.applicantDocumentStatus !== 'Rejected');
            if(unverifiedOrRejectedFiles.length > 0 ){
                this.showToast('Error', 'A few documents are still not verified or rejected.', 'error');
            }else {
                this.commentValue='';
                this.applicationInternalStatus = 'Not Selected Draft';
                this.displayRejectedReason = true;
                this.displayNotSelectedDraft = true;
                this.displayOnHold = false;
                this.commentVisibilityPopup = true;
                this.commentInputVisibility = false;
            }
        }else if(clickedButtonName === 'On Hold'){
            const unverifiedOrRejectedFiles = this.applicationFiles.filter(file => file.applicantDocumentStatus !== 'Verified' && file.applicantDocumentStatus !== 'Rejected');
            if(unverifiedOrRejectedFiles.length > 0 ){
                this.showToast('Error', 'A few documents are still not verified or rejected.', 'error');
            }else {
            this.commentValue='';
            this.applicationInternalStatus = 'On Hold';
            this.displayRejectedReason = true;
            this.displayNotSelectedDraft = false;
            this.displayOnHold = true;
            this.commentVisibilityPopup = true;
            this.commentInputVisibility = false;
            }
        }else if(clickedButtonName === 'overAllReviewCommnet'){
            const fields = {
                Id: this.recordId,
                Application_Review_Comment__c: this.OverAllReview
                };
                this.updateRecord(fields);
                this.isOverAllCommentEditMode = false;
                this.varificationButtonVisibilty = true;
        }else if(clickedButtonName === 'overAllReviewCommnetCancel'){
            this.isOverAllCommentEditMode = false;
            this.varificationButtonVisibilty = true;
            const fields = {
                Id: this.recordId,
                Application_Review_Comment__c: this.ReviewOld
                };
                this.updateRecord(fields);
        }else if(clickedButtonName==='RejectedReason'){
            this.commentValue='';
            const combobox = this.template.querySelector('lightning-combobox');
            combobox.setCustomValidity('');
            combobox.reportValidity();
            this.selectedRejectedReasonValue = event.detail.value;
            if(this.selectedRejectedReasonValue==='Others'){
                this.commentInputVisibility = true;
            }else{
                this.commentInputVisibility = false;
            }
        }else if(clickedButtonName === 'cancelComment'){
            this.commentVisibilityPopup = false;
            this.commentInputVisibility = false;
            this.displayRejectedReason =false;
            this.selectedRejectedReasonValue = '';
            this.commentValue = '';
        }else if(clickedButtonName === 'cancelVarificationClearPopup'){
            this.varificationClearPopup = false;
        }else if(clickedButtonName === 'closeRequireFieldPopup'){
            this.isRequiredFieldMissing = false;
        }else if(clickedButtonName === 'createAction'){
             this.rejectedFiles = this.applicationFiles.filter(file => file.applicantDocumentStatus === 'Rejected');
             const unverifiedOrRejectedFiles = this.applicationFiles.filter(file => file.applicantDocumentStatus !== 'Verified' && file.applicantDocumentStatus !== 'Rejected');
             if(unverifiedOrRejectedFiles.length > 0 ){
                this.showToast('Error', 'A few documents are still not verified or rejected.', 'error');
             }else if (this.rejectedFiles.length > 0 || this.missingDocuments.length > 0) {
                this.resumbisionComment = true;
                if (this.checkCommentValidity()) {
                    const applicationInternalStatus = 'Application Document Needs Resubmission';
                    const applicationExternalStatus = 'Application Document Needs Resubmission';
                    const fields = {
                        Id: this.recordId,
                        Application_Internal_Status__c: applicationInternalStatus,
                        Application_External_Status__c: applicationExternalStatus
                    };
                    this.updateRecord(fields);
                    this.createApplicationCommentRecord();
                    this.documentsVisibilityPopup = false;
                }
            } else {
                this.showToast('Error', 'No documents are fully rejected or have been rejected.', 'error');
            }
        }else if(clickedButtonName === 'saveComment'){
                const applicationInternalStatus = this.applicationInternalStatus;
            if(applicationInternalStatus === 'Verification Cleared'){
                const fields = {
                    Id: this.recordId,
                    Application_Internal_Status__c: this.applicationInternalStatus,
                };
                if (this.checkCommentValidity()) {
                    this.updateRecord(fields);
                    this.showToast('Success', this.applicationInternalStatus, 'Success');
                    this.commentVisibilityPopup = false;
                    this.commentInputVisibility = false;
                    this.createApplicationCommentRecord();
                    this.navigateToApplicationPage();
                }
            }else if(applicationInternalStatus === 'Not Selected Draft' || applicationInternalStatus === 'On Hold'){
                    const fields = {
                        Id: this.recordId,
                        Application_Internal_Status__c:applicationInternalStatus
                    };
                    if (this.CmntValidityNotSelected()) {
                        this.createApplicationCommentRecord();
                        this.updateRecord(fields);
                        this.commentVisibilityPopup = false;
                        this.navigateToApplicationPage();
                    }
            }else {
                if (this.checkCommentValidity()) {
                    this.createApplicationCommentRecord();
                    const fields = {
                        Id: this.recordId,
                        Application_Internal_Status__c:this.applicationInternalStatus};
                    this.updateRecord(fields);
                    this.commentVisibilityPopup = false;
                    this.navigateToApplicationPage();
                }
            }
        }
    }
    loadMissingDocuments() {
        const missingType = 'applicationDoc';
        getMissingDocumentTypes({ applicationId: this.recordId, missingType: missingType })
            .then(result => {
                if (result && result.length > 0) {
                    this.missingDocuments = result.map(docType => {
                        return { documentType: docType };
                    });
                } else {
                    this.missingDocuments = [];
                }
            })
            .catch(error => {
                this.showToast('Error',error.body.message?error.body.message: 'Failed to load Missing documents', 'error');
            });
    }
    checkCommentValidity() {
        const textareaElement = this.template.querySelector('lightning-textarea');
        if (!this.commentValue || this.commentValue.trim() === '') {
            textareaElement.setCustomValidity('Complete this field.');
            textareaElement.reportValidity();
            return false; 
        } else {
            textareaElement.setCustomValidity('');
            textareaElement.reportValidity();
            return true; 
        }
    }
    CmntValidityNotSelected() {
        const combobox = this.template.querySelector('lightning-combobox');
        const textarea = this.template.querySelector('lightning-textarea');
        let isValid = true;
        if (!this.selectedRejectedReasonValue) {
            combobox.setCustomValidity('Complete this field.');
            isValid = false;
        } else {
            combobox.setCustomValidity('');
        }
        combobox.reportValidity();
        if (this.selectedRejectedReasonValue === 'Others') {
            if (!this.commentValue) {
                textarea.setCustomValidity('Complete this field.');
                isValid = false;
            } else {
                textarea.setCustomValidity('');
            }
            textarea.reportValidity();
        }
        return isValid;
    }
    closeModal(){
        this.documentsVisibilityPopup=false;
        this.resumbisionComment = false;
        this.commentValue = '';
    }
    subscribeMessage(){
        this.subscription = subscribe(this.messageContext, apfsCoDocMessagingChannel, (message) => {    
            if((message!=undefined || message!=null) && message.operationType === 'ApfsCoApplicationApproveReject')
                {refreshApex(this.wiredDocumentsResult);}})
    }
    createApplicationCommentRecord() {
        createApplicationStatusComment({ 
            applicationId: this.recordId, 
            internalStatus: this.applicationInternalStatus, 
            comment: this.commentValue,
            rejectedResason: this.selectedRejectedReasonValue 
        })
        .then(result => {
            this.showToast('Success', this.applicationInternalStatus, 'Success');
            this.selectedRejectedReasonValue ='';
            this.displayRejectedReason = false;
            this.displayOnHold = false;
        })
        .catch(error => {
            this.showToast(error.body.message?error.body.message:'Failed to update.', 'error','Error');
        });
    }
    validateRequiredFields(name) {
        const missingFields = [];
        if (!this.selfPhoto) missingFields.push('Self Photo');
        if(this.isAadharAvailable==='Yes'){
            if (!this.aadhaarNo) missingFields.push('Aadhaar Number');
        }
        if (!this.mobilePhone) missingFields.push('Mobile Number');
        if (!this.state) missingFields.push('State');
        if (!this.district) missingFields.push('District');
        if (!this.birthDay) missingFields.push('Birth Date');
        if (!this.gender) missingFields.push('Gender');
        if (!this.fullAddress) missingFields.push('Address for Communication');        
        if (this.referredByAPFOrPartners === 'Yes') {
            if (!this.referralPartnerState) missingFields.push('Partner State');
            if (!this.referralPartnerName) missingFields.push('Name of the Partner');
        }
        if (!this.class12YearOfPassing) missingFields.push('Class 12 Year of Passing');
        if (!this.class12EducationMode) missingFields.push('Class 12 Mode of Education');
        if(this.class12EducationMode==='Regular'){
            if (!this.class12ExamBlock) missingFields.push('Class 12 Block');
            if (!this.class12SchoolName) missingFields.push('Class 12 Name of the School');
            if (this.class12SchoolName==='Others'){
                if (!this.class12otherSchoolName) missingFields.push('Class 12 Others Name of the School');
            }
        }else if(this.class12EducationMode==='Distance'){
            if (!this.class12BoardName) missingFields.push('Class 12 Board Name');
            if (this.class12BoardName==='Others'){
                if (!this.class12OtherBoardName) missingFields.push('Class 12 Others Board Name');
            }
        }
        if (!this.class12ExamState) missingFields.push('Class 12 State');
        if (!this.class12ExamDistrict) missingFields.push('Class 12 District');
        if (!this.class12percentage) missingFields.push('Class 12 Percentage');
        if (!this.class10YearOfPassing) missingFields.push('Class 10 Year of Passing');
        if (!this.class10EducationMode) missingFields.push('Class 10 Mode of Education');
        if(this.class10EducationMode==='Regular'){
            if (!this.class10ExamBlock) missingFields.push('Class 10 Exam Center Block');
            if (!this.class10SchoolName) missingFields.push('Class 10 Name of the School');
            if (this.class10SchoolName==='Others'){
                if (!this.class10otherSchoolName) missingFields.push('Class 10 Others Name of the School');
            }
        }else if(this.class10EducationMode==='Distance'){
            if (!this.class10BoardName) missingFields.push('Class 10 Board Name');
            if (this.class10BoardName==='Others'){
                if (!this.class10OtherBoardName) missingFields.push('Class 10 Others Board Name');
            }
        }
        if (!this.class10ExamState) missingFields.push('Class 10 State');
        if (!this.class10ExamDistrict) missingFields.push('Class 10 District');
        if (!this.class10percentage) missingFields.push('Class 10 Percentage');
        if(name === 'verificationClear'){
            if (!this.class10Rollno) missingFields.push('Class 10 Roll Number');
            if (!this.class12Rollno) missingFields.push('Class 12 Roll Number');
        }
        if(this.admissions.length===0){
            missingFields.push('Admission Details');
        }else{
            if (!this.admissions[0].Name_Of_The_Institute__c) missingFields.push('Admission Name of Institute');
            if(this.admissions[0].Name_Of_The_Institute__c === 'Others'){
                if (!this.admissions[0].Other_Name_Of_Institute__c) missingFields.push('Others Name of Institute');
            }
            if (!this.admissions[0].Institute_State__c) missingFields.push('Admission State');
            if (!this.admissions[0].Institute_District__c) missingFields.push('Admission District');
            if (!this.admissions[0].Course_Type__c) missingFields.push('Admission Course Type');
            if (!this.admissions[0].Course_Category__c) missingFields.push('Admission Course Category');
            if(this.admissions[0].Course_Category__c==='Others'){
                if (!this.admissions[0].Other_Course_Category__c) missingFields.push('Admission Others Course Category');
            }
            if (!this.admissions[0].Course_Name__c) missingFields.push('Admission Course Name');
            if (!this.admissions[0].Course_System__c) missingFields.push('Admission Course System');
            if (!this.admissions[0].Course_Duration_In_Years__c) missingFields.push('Admission Course Duration');
            if (!this.admissions[0].Course_Start_Date__c) missingFields.push('Admission Course Start Date');
            if (!this.admissions[0].Course_Year_Of_Studying__c) missingFields.push('Admission Course Year Of Studying');
        }
        this.isValid = missingFields.length === 0;
        if (!this.isValid) {
            this.popupMessage = `The following fields are missing: ${missingFields.join(', ')}`;
            this.isRequiredFieldMissing=true;
        } 
        return this.isValid;
    }
    navigateToApplicationPage() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Applications_Lightning'             
            }
        });
    }    
}