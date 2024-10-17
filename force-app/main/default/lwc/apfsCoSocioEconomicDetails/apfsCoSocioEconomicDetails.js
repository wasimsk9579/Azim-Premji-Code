import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { updateRecord } from "lightning/uiRecordApi";
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import { refreshApex } from '@salesforce/apex';
import { CurrentPageReference } from 'lightning/navigation';
import getFilesForRecord from '@salesforce/apex/APFS_GetRecords.getFilesForRecord';
import uploadFiles from '@salesforce/apex/APFS_FilesAndAttachmentUtilityController.uploadFileToServer';
import getFilesForTypeOne from '@salesforce/apex/APFS_GetFileDynamicController.getFilesForTypes';
import getFilesForTypeTwo from '@salesforce/apex/APFS_GetFileDynamicController.getFilesForTypes';

import deleteFileToServer from '@salesforce/apex/APFS_GetFileDynamicController.deleteFileToServer';
import USER_ID from '@salesforce/user/Id';
import CONTACT_ID_FIELD from '@salesforce/schema/User.ContactId';
import CONTACT_ID from '@salesforce/schema/Contact.Id';
import TYPE_OF_DISABILITY from '@salesforce/schema/Contact.Type_Of_Disablity__c';
import OTHER_DISABILITY_TYPE from '@salesforce/schema/Contact.Other_Disability_Type__c';
import SPECIALLY_ABLED from '@salesforce/schema/Contact.Specially_Abled__c';
import CATEGORY from '@salesforce/schema/Contact.Category__c';
import COMMUNITY_NAME from '@salesforce/schema/Contact.Community_Name__c';
import OTHER_CATEGORY from '@salesforce/schema/Contact.Other_Category__c';
import FAMILY_STATUS from '@salesforce/schema/Contact.Current_Family_Status__c';
import RELIGION from '@salesforce/schema/Contact.Religion__c';
import OTHER_RELIGION from '@salesforce/schema/Contact.Other_Religion__c';
import FAMILY_INCOME from '@salesforce/schema/Contact.Family_Income_Per_Year__c';
import EXTERNAL_APPLICATION_STATUS from '@salesforce/schema/Application__c.Application_External_Status__c';
import MOTHER_NAME from '@salesforce/schema/Contact.Mother_Full_Name__c';
import FATHER_NAME from '@salesforce/schema/Contact.Father_Full_Name__c';
import SOCIO_COMPLETED from '@salesforce/schema/Contact.Is_Socio_Economic_Details_Completed__c' ;
import SOCIO_PROGRESS_STATUS from '@salesforce/schema/Contact.Application_Forms_Progress_Percent__c' ;
import SCHOLARSHIP_ROUND_ID_FIELD from '@salesforce/schema/Application__c.Scholarship_Round__c';
import SCHOLARSHIP_ROUND_TYPE_FIELD from '@salesforce/schema/Scholarship_Round__c.Round_Type__c';



import SOCIO_HEADING_LABEL from '@salesforce/label/c.Socio_Economic_Header_Label';
import SPECIALLY_ABLED_PERSON from '@salesforce/label/c.Are_you_a_specially_abled_person';
import IF_YES_THEN_DISABILITY_TYPE from '@salesforce/label/c.If_yes_then_disability_type';
import IF_OTHERS_PLEASE_SPECIFY_DIS_TYPE from '@salesforce/label/c.If_others_please_specify_the_disability_type';
import RELIGION_LABEL from '@salesforce/label/c.Religion_Label';
import IF_OTHERS_SPECIFY_REL from '@salesforce/label/c.If_others_please_specify_the_religion';
import COMMUNITY_CATEGORY_LABEL from '@salesforce/label/c.Community_Category_Label';
import MENTION_COMMUNITY_NAME_HERE from '@salesforce/label/c.Please_mention_the_community_s_name_here';
import CURRENT_FAMILY_STATUS_LABEL from '@salesforce/label/c.Current_Family_Status_Label';
import SUCCESS_TOAST_LABEL from '@salesforce/label/c.Success_Label';
import ERROR_LABEL from '@salesforce/label/c.Error_Label';
import MAX_3_FILE_ERROR_CUSTOM_LABEL from '@salesforce/label/c.Max_3_file_error_custom_label';
import FAMILY_INCOME_PER_YEAR_LABEL from '@salesforce/label/c.Family_income_per_year_in_INR';
import COMMUNITY_NAME_lABEL from '@salesforce/label/c.Community_Name';
import FATHER_NAME_LABEL from '@salesforce/label/c.Father_s_Name_Label';
import MOTHER_NAME_LABEL from '@salesforce/label/c.Mother_s_Name_Label';
import HELP_TEXT_FOR_UPLOAD_LABEL from '@salesforce/label/c.Help_Text_For_Upload';
import UPLOAD_CASTE_AND_INCOME_CERTIFICATE from '@salesforce/label/c.Upload_Caste_and_Income_Certificate';
import UPLOAD_DISABILITY_CERTIFICATE from '@salesforce/label/c.Upload_Disability_Certificate';
import SELECT_AN_OPTION_LABEL from '@salesforce/label/c.Select_an_Option_label';
import SOCIO_ECONOMIC_UPDATED_SUCCESSFULLY_LABEL from '@salesforce/label/c.Socio_Economic_Updated_Successfully';
import UPLOADED_FILE_LABEL from '@salesforce/label/c.Uploaded_File_Label';
import FILE_SIZE_ERROR from '@salesforce/label/c.File_Size_Error_CustomLabel';
import INVALID_FILE_TYPE_ERROR_CUSTOM_LABEL from '@salesforce/label/c.Invalid_file_type_error_custom_label';
import PLEASE_UPLOAD_REQUIRED_DOCUMENTS_LABEL from '@salesforce/label/c.Please_Upload_Required_Documents_label';
import ENTER_IN_ENGLISH_LABEL from '@salesforce/label/c.Please_enter_the_text_in_English_helptext';


const CONTACT_FIELDS = [
    SOCIO_PROGRESS_STATUS,
    SOCIO_COMPLETED,
    MOTHER_NAME,
    FATHER_NAME,
    COMMUNITY_NAME,
    OTHER_RELIGION,
    TYPE_OF_DISABILITY, 
    OTHER_DISABILITY_TYPE,
    SPECIALLY_ABLED, 
    FAMILY_INCOME, 
    CATEGORY, 
    OTHER_CATEGORY,
    FAMILY_STATUS, 
    RELIGION,
];

export default class ApfsCoSocioEconomicDetails extends LightningElement {
    @track recordTypeId;
    @track userContactId;
    @track contactRecord;
    @track error;
    @track disabilityDataList = [];
    @track CasteDataList=[];
    @track isLoading = false;
    @track motherNotAvailable=true;
    @track fatherNotAvailable=true;
    base64=[];
    @track CasteUpdateDataList=[];
    @track disabilityUpdateDataList=[];
    speciallyAbledPersonOptions;
    disabilityTypeOptions;
    religionOptions;
    categoryOptions;
    familyStatusOptions;
    familyIncomeOptions;
    applicationId;
    externalApplicationStatus;

    // Store imported labels in variables
    socioHeadingLabel = SOCIO_HEADING_LABEL;
    speciAbledPersonLabel = SPECIALLY_ABLED_PERSON;
    ifYesThenDisabilityType = IF_YES_THEN_DISABILITY_TYPE;
    ifOthersPleaseSpecifyDisType = IF_OTHERS_PLEASE_SPECIFY_DIS_TYPE;
    religionLabel = RELIGION_LABEL;
    ifOthersSpecifyRel = IF_OTHERS_SPECIFY_REL;
    communityCategoryLabel = COMMUNITY_CATEGORY_LABEL;
    mentionCommunityNameHere = MENTION_COMMUNITY_NAME_HERE;
    currentFamilyStatusLabel = CURRENT_FAMILY_STATUS_LABEL;
    helptextforuploadlabel=HELP_TEXT_FOR_UPLOAD_LABEL;
    familyIncomePerYearLabel = FAMILY_INCOME_PER_YEAR_LABEL;
    communityNameLabel = COMMUNITY_NAME_lABEL ; 
    fatherNameLabel = FATHER_NAME_LABEL ;
    motherNameLabel = MOTHER_NAME_LABEL;
    uploadCasteAndIncomeCertificateLabel = UPLOAD_CASTE_AND_INCOME_CERTIFICATE ;
    uploadDisabilityCertificateLabel= UPLOAD_DISABILITY_CERTIFICATE ;
    selectanoptionlabel=SELECT_AN_OPTION_LABEL;
    uploadedfilelabel=UPLOADED_FILE_LABEL;
    invalidfiletypeerrorcustomlabel=INVALID_FILE_TYPE_ERROR_CUSTOM_LABEL;
    pleaseuploadrequireddocumentslabel=PLEASE_UPLOAD_REQUIRED_DOCUMENTS_LABEL;
    enterinenglishlabel=ENTER_IN_ENGLISH_LABEL;


    
    wiredSocioEconomicDetails;
    speciallyAbledPerson;

    disabilityType;
    otherDisability;
    religion;
    otherReligion;
    category;
    communityName;
    familyStatus;
    otherCategory;
    motherName;
    fatherName;
    familyIncome;
    
    isSpeciallyAbled = false;
    isOtherDisability = false;
    isOtherReligion = false;
    isCommunity = false;
    progressStatusValue;
    isSocioEconomicDetailsUpdated;
    progressPercent;

    isDisableAllFields = true;
    socioRecord ={}
    doccasttype=['Caste Certificate'];
    docdisablitytype=['Disability Certificate'];
    
    @wire(getRecord, { recordId: USER_ID, fields: [CONTACT_ID_FIELD] })
    wiredUser(result) {
        this.wiredUserResult = result;
        const { error, data } = result;
        if (data) {
            this.userContactId = getFieldValue(data, CONTACT_ID_FIELD);
        } else if (error) {
            this.showToast(ERROR_LABEL,error.body.message, 'error');
        }
    }

    @wire(getRecord, { recordId: '$userContactId', fields: CONTACT_FIELDS })
    wiredRecordTypeId(result) {
       
        const { error, data } = result;
        if (data) {
            this.recordTypeId = data?.recordTypeId;
        } else if (error) {
            this.showToast(ERROR_LABEL,error.body.message, 'error');
        }
    }

    @wire(getRecord, { recordId: '$userContactId', fields: CONTACT_FIELDS })
    wiredContactRecord({data, error}) {
        
        this.wiredSocioEconomicDetails = data;
        
        if (data) {
            this.contactRecord = data;
            this.isSocioEconomicDetailsUpdated= data?.fields?.Is_Socio_Economic_Details_Completed__c?.value;
            this.progressPercent = data?.fields?.Application_Forms_Progress_Percent__c?.value;
            this.loadContactDetails(data);
            this.handleCondetionalendering();
        } else if (error) {
            this.showToast(ERROR_LABEL,error.body.message, 'error');
        }
    }

    @wire(CurrentPageReference)
    currentPageReference;
    connectedCallback(){
       this.applicationId= this.currentPageReference?.attributes?.recordId || null;
       this.isLoading=true;
      this.fetchCastFiles();
      this.fetchDisabilityFiles();
       if (!this.applicationId) {
        this.showToast(ERROR_LABEL, 'Application ID not provided.', 'error');
        
    }
    }

    @wire(getRecord, { recordId: '$applicationId', fields: [EXTERNAL_APPLICATION_STATUS,SCHOLARSHIP_ROUND_ID_FIELD] })
    wiredApplicationId(result) {
      
        const { error, data } = result;
        if (data) {
            this.externalApplicationStatus = data?.fields?.Application_External_Status__c;

            this.scholarshipRoundId = getFieldValue(data, SCHOLARSHIP_ROUND_ID_FIELD) ?? null;


            if(this.externalApplicationStatus.value === 'Draft'){
                this.isDisableAllFields = false;
            }else{
    
                this.isDisableAllFields = true;
            }
        } else if (error) {
            this.showToast(ERROR_LABEL,error.body.message, 'error');

        }
    }

    @wire(getRecord, { recordId: '$scholarshipRoundId', fields: [SCHOLARSHIP_ROUND_TYPE_FIELD] })
    scholarshipRoundRecord({ error, data }) {
            
                if (data) {
                    this.scholarshipRoundType = getFieldValue(data, SCHOLARSHIP_ROUND_TYPE_FIELD) ?? null;
                   
                    
                } else if (error) {
                    this.showToast(ERROR_LABEL, 'Failed to load scholarship round data.', 'error');
                }
            
    }
    fetchDisabilityFiles() {
        getFilesForTypeTwo({documentTypes: this.docdisablitytype, appId: this.applicationId })
            .then(data => {
                this.wireFileApex = data;
    
                if (data) {
                    this.filedata = data;
                    this.disabilityDataList = [];
                    this.uploadfilename = [];
    
                    
                    const seenFilenames = new Set();
    
                    
                    data
                        .filter(file => {
                            const filenameWithExtension = file.title;
                            if (!seenFilenames.has(filenameWithExtension)) {
                                seenFilenames.add(filenameWithExtension);
                                return true;
                            }
                            return false;
                        })
                        .slice(0, 3)  // Limit to the first 3 unique files
                        .forEach(file => {
                            let base64Prefix = this.getBase64Prefix(file.title);
                            
                            const fileDataUrl = file.base64Data;
                            
                            const fileDetails = {
                                id: file.title, 
                                filename: file.title,
                                fileType: file.docType,
                                base64: fileDataUrl
                            };
    
                            this.disabilityDataList.push(fileDetails);
                        });
    
                    this.isLoading = false;
                } else {
                    this.fetchError = 'No data found';
                    this.isLoading = false;
                }
            })
            .catch(error => {
                this.fetchError = error.body.message || 'An error occurred';
                this.isLoading = false;
            });
    }
    


    fetchCastFiles() {
        getFilesForTypeOne({documentTypes: this.doccasttype, appId: this.applicationId })
            .then(data => {
                this.wireFileApex = data;
    
                if (data) {
                    this.filedata = data;
                    this.CasteDataList = [];
                    this.uploadfilename = [];
    
                    
                    const seenFilenames = new Set();
    
                    
                    data.filter(file => {
                            const filenameWithExtension = file.title;
                            if (!seenFilenames.has(filenameWithExtension)) {
                                seenFilenames.add(filenameWithExtension);
                                return true;
                            }
                            return false;
                        })
                        .slice(0, 3)  // Limit to the first 3 unique files
                        .forEach(file => {
                            const fileDataUrl = file.base64Data;
                            
                            const fileDetails = {
                                id: file.title, 
                                filename: file.title,
                                fileType: file.docType,
                                base64: fileDataUrl 
                            };
    
                            this.CasteDataList.push(fileDetails);
                        });
    
                    this.isLoading = false;
                } else {
                    this.isLoading = false;
                }
            })
            .catch(error => {
                this.isLoading=false;
            });
    }
    
    
   
    getBase64Prefix(filename) {
        if (filename.endsWith('.pdf')) {
            return 'data:application/pdf;base64,';
        } else if (filename.endsWith('.png')) {
            return 'data:image/png;base64,';
        } else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
            return 'data:image/jpeg;base64,';
        } else if (filename.endsWith('.img')) {
            return 'data:image/img;base64,';
        }
        return ''; 
    }


    loadContactDetails(data) {
       
        this.disabilityType = getFieldValue(data, TYPE_OF_DISABILITY);
        this.otherDisability = getFieldValue(data, OTHER_DISABILITY_TYPE);
        this.speciallyAbledPerson = getFieldValue(data, SPECIALLY_ABLED);
        this.religion = getFieldValue(data, RELIGION);
        this.otherReligion = getFieldValue(data, OTHER_RELIGION);
        this.fatherName = getFieldValue(data, FATHER_NAME);
        this.motherName = getFieldValue(data, MOTHER_NAME);

        this.category = getFieldValue(data, CATEGORY);
        this.otherCategory = data?.fields?.Other_Category__c?.value;
        this.communityName = getFieldValue(data, COMMUNITY_NAME);

        this.familyIncome = getFieldValue(data, FAMILY_INCOME);
        this.familyStatus = getFieldValue(data, FAMILY_STATUS);
    }
    
    handleCondetionalendering(){
        if(this.disabilityType !== null){
            if(this.disabilityType === 'Others'){
                this.isSpeciallyAbled  =true;
                this.isOtherDisability =true;
            }
        }  
        

        if(this.speciallyAbledPerson !== null){

            if(this.speciallyAbledPerson === 'Yes'){
                this.isSpeciallyAbled  =true;
               
            }else{
                this.isSpeciallyAbled  =false;
            }
        }
        
        if(this.religion !== null){
            if(this.religion === 'Others'){
                this.isOtherReligion = true;
            }
           
        }
        if(this.category !== null){
            if(this.category === 'Others'){
                this.isCommunity = true;
            }
           
        }
    }    
    
    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: SPECIALLY_ABLED })
    wiredSpeciallyAbledPicklistValues({ error, data }) {
        if (data) {
            this.speciallyAbledPersonOptions = data.values;
           
        } else if (error) {
            this.showToast(ERROR_LABEL,error.body.message, 'error');
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: TYPE_OF_DISABILITY })
    wiredDisabilityTypePicklistValues({ error, data }) {
        if (data) {
            this.disabilityTypeOptions = data.values;
            
        } else if (error) {
            this.showToast('Error',error.body.message, 'error');
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: FAMILY_INCOME })
    wiredFamilyIncomePicklistValues({ error, data }) {
        if (data) {
            this.familyIncomeOptions = data.values;
           
        } else if (error) {
            this.showToast('Error',error.body.message, 'error');
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: FAMILY_STATUS })
    wiredFamilyStatusPicklistValues({ error, data }) {
        if (data) {
            this.familyStatusOptions = data.values;
            
        } else if (error) {
            this.showToast('Error',error.body.message, 'error');
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: RELIGION })
    wiredReligionPicklistValues({ error, data }) {
        if (data) {
            this.religionOptions = data.values;
            
        } else if (error) {
            this.showToast('Error',error.body.message, 'error');
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: CATEGORY })
    wiredCategoryPicklistValues({ error, data }) {
        if (data) {
            this.categoryOptions = data.values;
           
        } else if (error) {
            this.showToast('Error',error.body.message, 'error');
        }
    }

    

    handleChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.value.replace(/\s+/g, ' ').trim();
        this[fieldName] = fieldValue;
       
        event.target.setCustomValidity('');
        event.target.reportValidity();
    
        switch (fieldName) {
            case 'speciallyAbledPerson':
                this.isSpeciallyAbled = fieldValue === 'Yes';
                if (fieldValue === 'No') {
                    this.resetSpeciallyAbledFields();
                }
                break;
            case 'disabilityType':
                this.isOtherDisability = fieldValue === 'Others';
                if (fieldValue !== 'Others') {
                    this.otherDisability = '';
                }
                break;
            case 'religion':
                this.isOtherReligion = fieldValue === 'Others';
                if (fieldValue !== 'Others') {
                    this.otherReligion = '';
                }
                break;
            case 'category':
                this.isCommunity = fieldValue === 'Others';
                {
                    this.communityName = '';
                    this.otherCategory = '';

                }
                break;
            case 'familyStatus':
                this.handleFamilyStatus(fieldValue,event);
                break;
        }
    }
    
    resetSpeciallyAbledFields() {
        this.isSpeciallyAbled = false;
        this.isOtherDisability = false;
        this.disabilityType = ''; 
        this.otherDisability = '';
    }

    validateInput(event) {
        const pattern = /^[a-zA-Z\s]*$/; 
 
        let inputChar = event.data ;
        if (!pattern.test(inputChar)) {
            event.preventDefault();
            }
    }


    handleKeyNamename(event) {
        const inputChar = event.key;
        const inputValue = event.target.value;
        const regex = /^[a-zA-Z\s]$/;
    
        
        if (inputValue.length === 0 && inputChar === ' ') {
            event.preventDefault();
            return;
        }
    
       
        const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
        if (!regex.test(inputChar) || inputChar === '.' || emojiRegex.test(inputChar)) {
            event.preventDefault();
        }
    }

    
    handlePaste(event) {
        event.preventDefault();
    }

    handleFormCompletionStatus() {
        let scholarshipType;
        let selcetedItem;
        if(this.scholarshipRoundType === 'Provisional'){                    
            scholarshipType='Provisional';
            selcetedItem='applicationSubmit'

        }else if(this.scholarshipRoundType === 'Regular'){
            scholarshipType='Regular';
            selcetedItem='admissionDetails'

        }
        const isCompleted = true;
        const event = new CustomEvent('formcompleted', {
            detail: { formName: 'socioEconomicDetails', isCompleted , selcetedItem:selcetedItem , isProvisional:scholarshipType}
        });
        this.dispatchEvent(event);
    }      

    handleDisabilityUpload(event) {
        this.fileUploadError = false;
        this.fileEvent = event.target;
        const files = event.target.files;
        this.isFileUploaded=true;
        this.fileUploadTypeError=false;
        
    
        if (this.disabilityDataList.length >= 3) {
            this.showToast(ERROR_LABEL, MAX_3_FILE_ERROR_CUSTOM_LABEL, 'error');
            return;
        }
        const remainingSlots = 3 - this.disabilityDataList.length;
        const filesToProcess = files.length > remainingSlots ? remainingSlots : files.length;
    
        for (let i = 0; i < filesToProcess; i++) {
            this.readDisabilityFile(files[i]);
        }
    }
    getNextDisabilityAvailableSequenceNumber() {
        const usedNumbers = new Set(this.disabilityDataList.map(disabilityFile => {
            const match = disabilityFile.filename.match(/_(\d+)\./);
            return match ? parseInt(match[1], 10) : null;
        }).filter(num => num !== null));
        if(usedNumbers){
            let nextNumber = 1;
        while (usedNumbers.has(nextNumber)) {
            nextNumber++;
        }
        return nextNumber;
        }
        
    }
    
    readDisabilityFile(disabilityFile) {
        const maxSize = 1.5 * 1024 * 1024; 
        if (disabilityFile.size > maxSize) {
            this.showToast(ERROR_LABEL, FILE_SIZE_ERROR, 'error');
            return;
        }

        const reader = new FileReader();
        const fileType ='Disability Certificate';

        reader.onload = () => {
            
            const extension = disabilityFile.name.split('.').pop().toLowerCase();
            const base64URL = reader.result.split(',')[1];

            if (['jpg', 'jpeg', 'png', 'pdf'].includes(extension)) {
                const nextSequenceNumber = this.getNextDisabilityAvailableSequenceNumber();
                const newFilename = this.generateNewFilename(disabilityFile.name, nextSequenceNumber);
                const fileData = {
                    id: newFilename,
                    filename: newFilename,
                    base64: base64URL,
                    fileType: fileType 
                };
               
                this.disabilityDataList = [...this.disabilityDataList, fileData];
                this.disabilityUpdateDataList = [...this.disabilityUpdateDataList, fileData];

            } else {
                this.fileUploadTypeError = true;
                this.showToast(ERROR_LABEL, INVALID_FILE_TYPE_ERROR_CUSTOM_LABEL, 'error');
            }
        };
        reader.readAsDataURL(disabilityFile);
    }
    generateNewFilename(originalFilename, sequenceNumber) {
        
        const [baseName, extension] = originalFilename.split('.').reduce((acc, part, index) => {
            if (index === 0) {
                acc[0] = part;
            } else {
                acc[1] = part;
            }
            return acc;
        }, []);
        
      
        return `${baseName}_${sequenceNumber}.${extension}`;
    }
    

    handlePreviewFile(event) {
        const fileId = event.target.dataset.id;
       
        const file = [...this.CasteDataList, ...this.disabilityDataList].find(file => String(file.id) === String(fileId));
       

    
        if (file) {
            const fileName = file.filename;
            const extensionType = fileName.split('.').pop().toLowerCase();
            const byteCharacters = atob(file.base64); 
            const byteNumbers = new Array(byteCharacters.length);
    
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            let mimeType;
    
            switch (extensionType) {
                case 'pdf':
                    mimeType = 'application/pdf';
                    break;
                case 'jpg':
                case 'jpeg':
                    mimeType = 'image/jpeg';
                    break;
                case 'png':
                    mimeType = 'image/png';
                    break;
                default:
                    mimeType = '';
            }
    
            const blob = new Blob([byteArray], { type: mimeType });
            const fileURL = URL.createObjectURL(blob);
            window.open(fileURL, '_blank');
        } else {
            this.isLoading=false;
        }
    }
    


    handleCasteRemove(event) {
        this.isLoading=true;
        const fileId = event.target.dataset.id;
        let fileToDelete;
        let fileToUpdateDelete;
        
        fileToDelete = this.CasteDataList.find(file => String(file.id) === String(fileId));
        this.CasteDataList = this.CasteDataList.filter(item => String(item.id) !== String(fileId));
        this.CasteDataList = this.CasteDataList.filter(file => file.id !== fileId);

        fileToUpdateDelete = this.CasteUpdateDataList.find(file => String(file.id) === String(fileId));
        this.CasteUpdateDataList = this.CasteUpdateDataList.filter(item => String(item.id) !== String(fileId));
        this.CasteUpdateDataList = this.CasteUpdateDataList.filter(file => file.id !== fileId);
        
        
        this.isFileUploaded = this.CasteDataList.length > 0;

        if (fileToUpdateDelete) {
           
            this.handledeletefile(fileToUpdateDelete.id, fileToUpdateDelete.filename,fileToUpdateDelete.fileType,this.applicationId);
            
        } 
        if (fileToDelete) {
            
            this.handledeletefile(fileToDelete.id, fileToDelete.filename,fileToDelete.fileType,this.applicationId);
            
        } 
        this.validateFileCount();
    }

    handleDisabilityRemove(event) {
        const fileId = event.target.dataset.id;
        this.isLoading=true;
        let fileToDelete;
        let filetoUpdateDelete;
        
       

        fileToDelete = this.disabilityDataList.find(file => String(file.id) === String(fileId));
        this.disabilityDataList = this.disabilityDataList.filter(item => String(item.id) !== String(fileId));
        this.disabilityDataList = this.disabilityDataList.filter(file => file.id !== fileId);

        filetoUpdateDelete = this.disabilityUpdateDataList.find(file => String(file.id) === String(fileId));
        this.disabilityUpdateDataList = this.disabilityUpdateDataList.filter(item => String(item.id) !== String(fileId));
        this.disabilityUpdateDataList = this.disabilityUpdateDataList.filter(file => file.id !== fileId);
        

        this.isFileUploaded = this.disabilityDataList.length > 0;
        if (filetoUpdateDelete) {
           
            this.handledeletefile(filetoUpdateDelete.id, filetoUpdateDelete.filename,filetoUpdateDelete.fileType,this.applicationId);
            
        } 
        if (fileToDelete) {
            
            this.handledeletefile(fileToDelete.id, fileToDelete.filename,fileToDelete.fileType,this.applicationId);
            
        } 
        this.validateFileCount();
    }

    validateFileCount() {
       
        const fileInput = this.template.querySelector('lightning-input[type="file"]');
        if (this.disabilityDataList.length === 0) {
            fileInput.setCustomValidity('Please upload at least one file.');
        } else {
            fileInput.setCustomValidity('');
        }
        fileInput.reportValidity();
    }
    

    handleCasteUpload(event) {
        this.fileUploadError = false;
        this.fileEvent = event.target;
        const files = event.target.files;
        this.isFileUploaded=true;
        this.fileUploadTypeError=false;
        
    
        if (this.CasteDataList.length >= 3) {
            this.showToast(ERROR_LABEL, MAX_3_FILE_ERROR_CUSTOM_LABEL, 'error');
            return;
        }
        const remainingSlots = 3 - this.CasteDataList.length;
        const filesToProcess = files.length > remainingSlots ? remainingSlots : files.length;
    
        for (let i = 0; i < filesToProcess; i++) {
            this.readCasteFile(files[i]);
        }
    }
    getNextCasteAvailableSequenceNumber() {
        const usedNumbers = new Set(this.CasteDataList.map(casteFile => {
            const match = casteFile.filename.match(/_(\d+)\./); 
            return match ? parseInt(match[1], 10) : null;
        }).filter(num => num !== null));
    
        let nextNumber = 1;
        while (usedNumbers.has(nextNumber)) {
            nextNumber++;
        }
        return nextNumber;
    }
    readCasteFile(casteFile) {
        const maxSize = 1.5 * 1024 * 1024; 
        if (casteFile.size > maxSize) {
            this.showToast(ERROR_LABEL, FILE_SIZE_ERROR, 'error');
            return;
        }

        const reader = new FileReader();
        const fileType ='Caste Certificate';

        reader.onload = () => {
           
            const extension = casteFile.name.split('.').pop().toLowerCase();
            const base64URL = reader.result.split(',')[1];

            if (['jpg', 'jpeg', 'png', 'pdf'].includes(extension)) {
                const nextSequenceNumber = this.getNextCasteAvailableSequenceNumber();
                const newFilename = this.generateNewFilename(casteFile.name, nextSequenceNumber);
                const fileData = {
                    id: newFilename,
                    filename: newFilename,
                    base64:  base64URL,
                    fileType: fileType 
                };
                this.CasteDataList = [...this.CasteDataList, fileData];
                this.CasteUpdateDataList=[...this.CasteUpdateDataList, fileData];
               
            } else {
                this.fileUploadTypeError = true;
                this.showToast(ERROR_LABEL, INVALID_FILE_TYPE_ERROR_CUSTOM_LABEL, 'error');
            }
        };
        reader.readAsDataURL(casteFile);
    }

    handledeletefile(fileId, filename, fileType, applicationId) {
        deleteFileToServer({ deletefilename: filename, fileType: fileType, applicationId: applicationId })
            .then(() => {

                this.isLoading=false;
               
            })
            .catch((error) => {
                
                this.isLoading=false;
            });
    }
    

    handleSaveAndContinue() {
        this.isLoading = true;
        if(this.isSocioEconomicDetailsUpdated === false){
            this.progressStatusValue = this.progressPercent + parseInt(25);
        }else{
             this.progressStatusValue = this.progressPercent;
        }
       
       
    
       
        this.updateContact();
         if(this.isSocioEconomicDetailsUpdated===false)
        {
            const disabilityDataList = this.disabilityDataList;

            
            disabilityDataList.forEach((fileData) => {
                const { filename, base64, fileType } = fileData;
            
                uploadFiles({
                    base64Data: base64,
                    fileName: filename,
                    documentType: fileType,
                    applicationId: this.applicationId 
                })
                .then(() => {
                   
                    this.isLoading = false;
                })
                .catch((error) => {
                    this.showToast('Error', errorMessage, 'error');
                    this.isLoading = false;
                });
            });

            const CasteDataList = this.CasteDataList;

           
            CasteDataList.forEach((fileData) => {
                const { filename, base64, fileType } = fileData;
            
                uploadFiles({
                    base64Data: base64,
                    fileName: filename,
                    documentType: fileType,
                    applicationId: this.applicationId
                })
                .then(() => {

                    this.isLoading = false;
                })
                .catch((error) => {
                    this.showToast('Error', errorMessage, 'error');
                    this.isLoading = false;
                });
            });

        }     
         if(this.isSocioEconomicDetailsUpdated===true)
        {   
            const disabilityUpdateDataList = this.disabilityUpdateDataList;
            const CasteUpdateDataList = this.CasteUpdateDataList;

            
            disabilityUpdateDataList.forEach((fileData) => {
                const { filename, base64, fileType } = fileData;
            
                uploadFiles({
                    base64Data: base64,
                    fileName: filename,
                    documentType: fileType,
                    applicationId: this.applicationId
                })
                .then(() => {
                   this.isLoading=false;
                  
                })
                .catch((error) => {
                    const errorMessage = error.body ? error.body.message : error.message;
                    this.showToast('Error', errorMessage, 'error');
                   
                });
            
            });
            CasteUpdateDataList.forEach((fileData) => {
                const { filename, base64, fileType } = fileData;
            
                uploadFiles({
                    base64Data: base64,
                    fileName: filename,
                    documentType: fileType,
                    applicationId: this.applicationId
                })
                .then(() => {
                     this.isLoading=false;
                  
                 
                })
                .catch((error) => {
                    const errorMessage = error.body ? error.body.message : error.message;
                    this.showToast('Error', errorMessage, 'error');
                   
                });
            });
            
            }
    }
    async updateContact() {
       
        const field = {};
        field[CONTACT_ID .fieldApiName] = this.userContactId;
        field[SPECIALLY_ABLED .fieldApiName] =this.speciallyAbledPerson;
        field[TYPE_OF_DISABILITY .fieldApiName] =this.disabilityType;
        field[OTHER_DISABILITY_TYPE .fieldApiName] =this.otherDisability;
        field[FAMILY_STATUS .fieldApiName] =this.familyStatus;
        field[FATHER_NAME .fieldApiName] =this.fatherName;
        field[MOTHER_NAME .fieldApiName] =this.motherName;
        field[FAMILY_INCOME .fieldApiName] =this.familyIncome;
        field[RELIGION .fieldApiName] =this.religion;
        field[OTHER_RELIGION .fieldApiName] =this.otherReligion;
        field[CATEGORY .fieldApiName] =this.category;
        field[OTHER_CATEGORY .fieldApiName] =this.otherCategory;
        field[COMMUNITY_NAME .fieldApiName] =this.communityName;
        field[SOCIO_COMPLETED .fieldApiName] =true;
        field[SOCIO_PROGRESS_STATUS .fieldApiName] =this.progressStatusValue;

        
        
        const recordInput = { fields: field };
       

        
        try {
            await updateRecord(recordInput).then((res) => {
                
            this.showToast(SUCCESS_TOAST_LABEL, SOCIO_ECONOMIC_UPDATED_SUCCESSFULLY_LABEL, 'success');
            this.handleFormCompletionStatus();
            this.scrollToTop();
            return refreshApex(this.contactRecord);
            })

            
        }
        catch (error) {
            const errorMessage = error.body ? error.body.message : error.message;
            this.showToast(ERROR_TOAST_LABEL, errorMessage, 'error');
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
    scrollToTop() {
       
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    
       
        if (scrollableContainer) {
            scrollableContainer.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }
    

}