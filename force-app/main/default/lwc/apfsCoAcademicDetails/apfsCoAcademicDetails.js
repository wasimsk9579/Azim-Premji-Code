/***************************************************************************************************************************************
 * Name of Developer: pooja.v@cloudodyssey.co
 * Description : This components is to get the academic details of the Applicant.
 * JIRA Key : #APFSP-9, #APFSP-7, #APFSP-10
 * Created Date: 12-07-2024 (pooja.v@cloudodyssey.co)
 * LastModified Date: 08-08-2024 (pooja.v@cloudodyssey.co)
 * ***************************************************************************************************************************************/

// Standard lightning library imports
import { LightningElement,wire,api,track } from 'lwc';
import { getRecord, getFieldValue,updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from "@salesforce/apex";
import { getPicklistValues } from 'lightning/uiObjectInfoApi'
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { CurrentPageReference } from 'lightning/navigation';

import getFilesForRecord from '@salesforce/apex/APFS_GetFileDynamicController.getFilesForTypes';
import uploadEducationFiles from '@salesforce/apex/APFS_FilesAndAttachmentUtilityController.uploadFileToServer';
import getStatePicklistValues from '@salesforce/apex/APFS_StateDistrictUtilityController.fetchSpecificStates';
import getDistrictPicklistValues from '@salesforce/apex/APFS_StateDistrictUtilityController.getSpecificDistrictPicklistValues';
import getBlockPicklistValues from '@salesforce/apex/APFS_StateDistrictUtilityController.getBlockPicklistValues';
import getSchoolsOrBoard from '@salesforce/apex/APFS_StateDistrictUtilityController.getSchoolsOrBoard';
import deleteFileToServer from '@salesforce/apex/APFS_GetFileDynamicController.deleteFileToServer';

import USER_ID from '@salesforce/user/Id';
import CONTACT_ID_FIELD from '@salesforce/schema/User.ContactId';
import MODE_OF_EDUCATION_OPTIONS from '@salesforce/schema/Contact.Class_Eight_Education_Mode__c';
import CONTACT_ID from '@salesforce/schema/Contact.Id';
import APPLICATION_PROGRESS_PERCENT from '@salesforce/schema/Contact.Application_Forms_Progress_Percent__c';
import IS_AADHAAAR from '@salesforce/schema/Contact.Is_Aadhaar_Available__c' ;
import EXTERNAL_APPLICATION_STATUS from '@salesforce/schema/Application__c.Application_External_Status__c';
import CLASS_EIGHT_BOARD_NAME from '@salesforce/schema/Contact.Class_Eight_Board_Name__c' ;
import CLASS_EIGHT_OTHER_BOARD_NAME from '@salesforce/schema/Contact.Class_Eight_Other_Board_Name__c' ;

import CLASS_EIGHT_EDUCATION_MODE from '@salesforce/schema/Contact.Class_Eight_Education_Mode__c' ;
import CLASS_EIGHT_EXAM_CENTRE_DISTRICT from '@salesforce/schema/Contact.Class_Eight_Exam_Centre_District__c';
import CLASS_EIGHT_EXAM_CENTRE_PINCODE from '@salesforce/schema/Contact.Class_Eight_Exam_Centre_Pincode__c';
import CLASS_EIGHT_EXAM_CENTRE_STATE from '@salesforce/schema/Contact.Class_Eight_Exam_Centre_State__c' ;
import CLASS_EIGHT_SCHOOL_NAME from '@salesforce/schema/Contact.Class_Eight_Name_Of_School__c' ;
import CLASS_EIGHT_OTHER_SCHOOL_NAME from '@salesforce/schema/Contact.Class_Eight_Other_Name_Of_School__c' ;
import CLASS_EIGHT_PASS_PERCENTAGE from '@salesforce/schema/Contact.Class_Eight_Pass_Percentage__c';
import CLASS_EIGHT_YEAR_OF_PASSING from '@salesforce/schema/Contact.Class_Eight_Year_Of_Passing__c';
import CLASS_EIGHT_EXAM_BLOCK from '@salesforce/schema/Contact.Class_Eight_Exam_Center_Block__c';

import CLASS_TEN_BOARD_NAME from '@salesforce/schema/Contact.Class_Ten_Board_Name__c' ;
import CLASS_TEN_OTHER_BOARD_NAME from '@salesforce/schema/Contact.Class_Ten_Other_Board_Name__c' ;
import CLASS_TEN_EDUCATION_MODE from '@salesforce/schema/Contact.Class_Ten_Education_Mode__c' ;
import CLASS_TEN_EXAM_CENTRE_DISTRICT from '@salesforce/schema/Contact.Class_Ten_Exam_Centre_District__c' ;
import CLASS_TEN_EXAM_CENTRE_PINCODE from '@salesforce/schema/Contact.Class_Ten_Exam_Centre_Pincode__c' ;
import CLASS_TEN_EXAM_CENTRE_STATE from '@salesforce/schema/Contact.Class_Ten_Exam_Centre_State__c' ;
import CLASS_TEN_SCHOOL_NAME from '@salesforce/schema/Contact.Class_Ten_Name_Of_School__c' ;
import CLASS_TEN_OTHER_SCHOOL_NAME from '@salesforce/schema/Contact.Class_Ten_Other_Name_Of_School__c' ;
import CLASS_TEN_PASS_PERCENTAGE from '@salesforce/schema/Contact.Class_Ten_Pass_Percentage__c' ;
import CLASS_TEN_YEAR_OF_PASSING from '@salesforce/schema/Contact.Class_Ten_Year_Of_Passing__c' ;
import CLASS_TEN_EXAM_BLOCK from '@salesforce/schema/Contact.Class_Ten_Exam_Center_Block__c';


import CLASS_TWELVE_BOARD_NAME from '@salesforce/schema/Contact.Class_Twelve_Board_Name__c' ;
import CLASS_TWELVE_EDUCATION_MODE from '@salesforce/schema/Contact.Class_Twelve_Education_Mode__c' ;
import CLASS_TWELVE_EXAM_CENTRE_DISTRICT from '@salesforce/schema/Contact.Class_Twelve_Exam_Centre_District__c' ;
import CLASS_TWELVE_EXAM_CENTRE_PINCODE from '@salesforce/schema/Contact.Class_Twelve_Exam_Centre_Pincode__c' ;
import CLASS_TWELVE_EXAM_CENTRE_STATE from '@salesforce/schema/Contact.Class_Twelve_Exam_Centre_State__c' ;
import CLASS_TWELVE_SCHOOL_NAME from '@salesforce/schema/Contact.Class_Twelve_Name_Of_School__c' ;
import CLASS_TWELVE_OTHER_SCHOOL_NAME from '@salesforce/schema/Contact.Class_Twelve_Other_Name_Of_School__c' ;
import CLASS_TWELVE_PASS_PERCENTAGE from '@salesforce/schema/Contact.Class_Twelve_Pass_Percentage__c' ;
import CLASS_TWELVE_YEAR_OF_PASSING from '@salesforce/schema/Contact.Class_Twelve_Year_Of_Passing__c' ;
import CLASS_TWELVE_EXAM_BLOCK from '@salesforce/schema/Contact.Class_Twelve_Exam_Center_Block__c';
import CLASS_TWELVE_OTHER_BOARD_NAME from '@salesforce/schema/Contact.Class_Twelve_Other_Board_Name__c' ;
import BIRTH_DATE from '@salesforce/schema/Contact.Birthdate' ;
import EDU_COMPLETED from '@salesforce/schema/Contact.Is_Education_Details_Completed__c' ;
import EDU_PROGRESS_STATUS from '@salesforce/schema/Contact.Application_Forms_Progress_Percent__c' ;

//custom labels for multi language
import EDUCATION_HEADING from '@salesforce/label/c.Education_Heading';
import CLASS_8_DETAILS from '@salesforce/label/c.Class_8_details';
import YEAR_OF_PASSING_LABEL from '@salesforce/label/c.Year_of_Passing_Label';
import MODE_OF_EDUCATION_LABEL from '@salesforce/label/c.Mode_of_Education_Label';
import SELECT_STATE_OF_THE_EXAM_CENTER_LABEL from '@salesforce/label/c.Select_State_of_the_Exam_Center_Label';
import SELECT_DISTRICT_OF_THE_EXAM_CENTER_LABEL from '@salesforce/label/c.Select_District_of_the_Exam_Center_Label';
import SELECT_BLOCK_OF_THE_EXAM_CENTER_LABEL from '@salesforce/label/c.Select_Block_of_the_Exam_Center_label';
import PINCODE_LABEL from '@salesforce/label/c.Pincode_label';
import NAME_OF_THE_SCHOOL_LABEL from '@salesforce/label/c.Name_of_the_School_label';
import IS_OTHERS_PLEASE_ENTER_NAME_OF_THE_SCHOOL from '@salesforce/label/c.Is_other_s_Please_enter_name_of_the_school';
import BOARD_NAME_LABEL from '@salesforce/label/c.Board_Name_Label';
import IS_OTHERS_PLEASE_ENTER_BOARD_NAME from '@salesforce/label/c.Is_other_s_Please_enter_board_name';
import PERCENTAGE_LABEL from '@salesforce/label/c.Percentage_Label';
import ATTACH_CLASS_8_MARKSHEET_LABEL from '@salesforce/label/c.Attach_Class_8_Marksheet_Label';
import CLASS_10_DETAILS_LABEL from '@salesforce/label/c.Class_10_details_Label';
import ATTACH_CLASS_10_MARKSHEET_LABEL from '@salesforce/label/c.Attach_Class_10_Marksheet_Label';
import CLASS_12_DETAILS_LABEL from '@salesforce/label/c.Class_12_details_Label';
import SCHOLARSHIP_TYPE_LABEL from '@salesforce/label/c.Scholarship_Type_Label';
import ATTACH_CLASS_12_MARKSHEET_LABEL from '@salesforce/label/c.Attach_Class_12_Marksheet_Label';
import ENTER_IN_ENGLISH_LABEL from '@salesforce/label/c.Please_enter_the_text_in_English_helptext';
import Complete_This_Field_Label from '@salesforce/label/c.Complete_this_field_Label';
import Future_Year_Error_Label from '@salesforce/label/c.Future_Year_Error_Label';
import Less_Than_4_Digits_Error_Label from '@salesforce/label/c.Less_Than_4_Digits_Error_Label';
import X12_Same_As_10_Erro_Label from '@salesforce/label/c.X12_Same_As_10_Erro_Label';
import X12_same_as_8_Error_Label from '@salesforce/label/c.X12_same_as_8_Error_Label';
import X10_Same_As_12_Error_Label from '@salesforce/label/c.X10_Same_As_12_Error_Label';
import X10_Same_As_8_Error_Label from '@salesforce/label/c.X10_Same_As_8_Error_Label';
import X8_Same_As_12_Error_Label from '@salesforce/label/c.X8_Same_As_12_Error_Label';
import X8_Same_As_10_Error_Label from '@salesforce/label/c.X8_Same_As_10_Error_Label';
import X12_As_2022_Class_10_as_2021_Label from '@salesforce/label/c.X12_As_2022_Class_10_as_2021_Label';
import X12_As_2022_Class_8_As_2021_Label from '@salesforce/label/c.X12_As_2022_Class_8_As_2021_Label';
import X8_As_2023_Class_12_As_2022_Label from '@salesforce/label/c.X8_As_2023_Class_12_As_2022_Label';
import X8_As_2023_Class_10_As_2022_Label from '@salesforce/label/c.X8_As_2023_Class_10_As_2022_Label';
import Less_Than_1990_Label from '@salesforce/label/c.Less_Than_1990_Label';
import X10As12_Label from '@salesforce/label/c.X10As12_Label';
import X10_Gap_8_Label from '@salesforce/label/c.X10_Gap_8_Label';
import Education_Success_Label from '@salesforce/label/c.Education_Success_Label';
import Success_Label from '@salesforce/label/c.Success_Label';
import Pin_code_should_be_exactly_6_digits_label from '@salesforce/label/c.Pin_code_should_be_exactly_6_digits_label';
import File_Size_Error_CustomLabel from '@salesforce/label/c.File_Size_Error_CustomLabel';
import More_Than_3_Files_Error_Label from '@salesforce/label/c.More_Than_3_Files_Error_Label';	
import Error_Label from '@salesforce/label/c.Error_Label';
import Invalid_file_type_error_custom_label from '@salesforce/label/c.Invalid_file_type_error_custom_label';
import Less_Than_33_Error_Label from '@salesforce/label/c.Less_Than_33_Error_Label';
import Year_Help_Text_Errror_Label from '@salesforce/label/c.Year_Help_Text_Errror_Label';
import Percentage_Help_Text_Label from '@salesforce/label/c.Percentage_Help_Text_Label';
import Upload_Files_Label from '@salesforce/label/c.Upload_Files_Label';
import Uploaded_File_Label from '@salesforce/label/c.Uploaded_File_Label';
import File_Help_Test_Label from '@salesforce/label/c.File_Help_Test_Label';
import Select_an_Option_label from '@salesforce/label/c.Select_an_Option_label';

const CONTACT_FIELDS = [
IS_AADHAAAR,
EDU_COMPLETED,
EDU_PROGRESS_STATUS,
CLASS_EIGHT_OTHER_BOARD_NAME,
CLASS_EIGHT_YEAR_OF_PASSING,
CLASS_EIGHT_EDUCATION_MODE,
CLASS_EIGHT_BOARD_NAME,
CLASS_EIGHT_SCHOOL_NAME,
CLASS_EIGHT_OTHER_SCHOOL_NAME,
CLASS_EIGHT_EXAM_CENTRE_STATE,
CLASS_EIGHT_EXAM_CENTRE_DISTRICT,
CLASS_EIGHT_EXAM_CENTRE_PINCODE,
CLASS_EIGHT_PASS_PERCENTAGE,
CLASS_EIGHT_EXAM_BLOCK,

CLASS_TEN_YEAR_OF_PASSING,
CLASS_TEN_OTHER_BOARD_NAME,
CLASS_TEN_EDUCATION_MODE,
CLASS_TEN_BOARD_NAME,
CLASS_TEN_SCHOOL_NAME,
CLASS_TEN_OTHER_SCHOOL_NAME,
CLASS_TEN_EXAM_CENTRE_STATE,
CLASS_TEN_EXAM_CENTRE_DISTRICT,
CLASS_TEN_EXAM_CENTRE_PINCODE,
CLASS_TEN_PASS_PERCENTAGE,
CLASS_TEN_EXAM_BLOCK,

CLASS_TWELVE_YEAR_OF_PASSING,
CLASS_TWELVE_OTHER_BOARD_NAME,
CLASS_TWELVE_EDUCATION_MODE,
CLASS_TWELVE_BOARD_NAME,
CLASS_TWELVE_SCHOOL_NAME,
CLASS_TWELVE_OTHER_SCHOOL_NAME,
CLASS_TWELVE_EXAM_CENTRE_STATE,
CLASS_TWELVE_EXAM_CENTRE_DISTRICT,
CLASS_TWELVE_EXAM_CENTRE_PINCODE,
CLASS_TWELVE_PASS_PERCENTAGE,
APPLICATION_PROGRESS_PERCENT,
CLASS_TWELVE_EXAM_BLOCK,
BIRTH_DATE,

];

export default class ApfsCoAcademicDetails extends LightningElement {

    // Store imported labels in variables
    requiredFieldError = Complete_This_Field_Label;
    yearHelpText=Year_Help_Text_Errror_Label;
    Percentage_Help_Text_Label = Percentage_Help_Text_Label;
    Upload_Files_Label=Upload_Files_Label;
    Uploaded_File_Label=Uploaded_File_Label;
    File_Help_Test_Label=File_Help_Test_Label;
    More_Than_3_Files_Error_Label=More_Than_3_Files_Error_Label;
    Error_Label=Error_Label;
    selectanoptionlabel=Select_an_Option_label;

    educationHeading = EDUCATION_HEADING;
    class8Details = CLASS_8_DETAILS;
    yearOfPassingLabel = YEAR_OF_PASSING_LABEL;
    modeOfEducationLabel = MODE_OF_EDUCATION_LABEL;
    selectStateOfExamCenterLabel = SELECT_STATE_OF_THE_EXAM_CENTER_LABEL;
    selectDistrictOfExamCenterLabel = SELECT_DISTRICT_OF_THE_EXAM_CENTER_LABEL;
    selectBlockOfExamCenterLabel = SELECT_BLOCK_OF_THE_EXAM_CENTER_LABEL;
    pincodeLabel = PINCODE_LABEL;
    nameOfSchoolLabel = NAME_OF_THE_SCHOOL_LABEL;
    isOthersPleaseEnterNameOfSchool = IS_OTHERS_PLEASE_ENTER_NAME_OF_THE_SCHOOL;
    boardNameLabel = BOARD_NAME_LABEL;
    isOthersPleaseEnterBoardName = IS_OTHERS_PLEASE_ENTER_BOARD_NAME;
    percentageLabel = PERCENTAGE_LABEL;
    attachClass8MarksheetLabel = ATTACH_CLASS_8_MARKSHEET_LABEL;
    class10DetailsLabel = CLASS_10_DETAILS_LABEL;
    attachClass10MarksheetLabel = ATTACH_CLASS_10_MARKSHEET_LABEL;
    class12DetailsLabel = CLASS_12_DETAILS_LABEL;
    scholarshipTypeLabel = SCHOLARSHIP_TYPE_LABEL;
    attachClass12MarksheetLabel = ATTACH_CLASS_12_MARKSHEET_LABEL;
    enterinenglishlabel=ENTER_IN_ENGLISH_LABEL;

boardNameOptions 
recordTypeId;
userContactId;
accountId;
contactRecord;
contactDetails;
progressPercent ;
applicationId;
externalApplicationStatus;
isDisableAcademicAllFields = false;

class8ExamDistrictLabel;
class10ExamDistrictLabel;
class12ExamDistrictLabel

modeOfEducationOptions;
class8YearOfPassing;
class8ModeOfEducation;
class8SchoolName;
class8BoardName;
class8PassPercentage;
class8FileName;
class8FileUrl;
class8ExamState;
class8ExamDistrict;
class8ExamBlock
class8Pincode;
class8otherSchoolName;
otherClass8BoardName;

// Class 10 details
class10YearOfPassing;
class8PassPercentage;
class10SchoolName;
class10BoardName;
class10PassPercentage;
class10FileName;
class10FileUrl;
class10ExamState;
class10ExamDistrict;
class10Pincode;
class10ExamBlock;
class10otherSchoolName;
otherClass10BoardName;

// Class 12 details
class12YearOfPassing;
class12ModeOfEducation;
class12SchoolName;
class12BoardName;
class12PassPercentage;
class12FileName;
class12FileUrl;
class12ExamState;
class12ExamDistrict;
class12Pincode;
class12ExamBlock;
class12otherSchoolName;
otherClass12BoardName;
class8MarksheetBase64;
class10MarksheetBase64;
class12MarksheetBase64;

file;
class8FileType;
class10FileType;
class12FileType;
isAadhaar = false;
isClass12FileName = true;
isClass10FileName = true;
isClass8FileName = true;
isLoading = false;
@track class12Section = true;
@track class10Section = false;
@track class8Section = false;


contactDOB;
// Variable used for conditional rendering
isClass8ModeOfEducationRegular=false;
isClass10ModeOfEducationRegular=false;
isClass12ModeOfEducationRegular=false;
isClass8ModeOfEducationDistance=false;
isClass10ModeOfEducationDistance=false;
isClass12ModeOfEducationDistance=false;
isOtherClass8SchoolName = false;
isOtherClass10SchoolName =false;
isOtherClass12SchoolName =false;
isOtherClass8BoardName = false;
isOtherClass10BoardName =false;
isOtherClass12BoardName =false;
isState8Selected =true;
isDistrict8Selected =true;
isBlock8Selected = true;
isPincode8Selected = true;
isState10Selected =true;
isDistrict10Selected =true;
isBlock10Selected = true;
isPincode10Selected = true;
isState12Selected =true;
isDistrict12Selected =true;
isBlock12Selected = true;
isPincode12Selected = true;
isFileAvailable;
wiredAcademicDetails={};
districtsOptions8 = [];
filteredSchoolNameOptions8 = [];
filteredBlockOptions8 = [];

districtsOptions10 = [];
filteredSchoolNameOptions10 = [];
filteredBlockOptions10 = []

districtsOptions12 = [];
filteredSchoolNameOptions12 = [];
filteredBlockOptions12 = []

districtsOptions=[];
blockOption=[];
schoolNameOptions=[];
fileList =[];
fetchError;
fileNames = [];
fileUrls = [];
statesOptions = []; 
selectedStateId = [];
selectedDistrictId = [];
selectedExamBlockId = [];
selectedState = [];

class12DocumentTypes = ['Class Twelve Marks Card'];
class10DocumentTypes = ['Class Ten Marks Card'];
class8DocumentTypes = ['Class Eight Marks Card'];

@track filteredSchools = [];
selectedBlockName='';
noResults = false;
showSchoolDetails = false;
@track searchResults = [];
@track class12SchoolName = '';
@track class10SchoolName = '';
@track class8SchoolName = '';
@track classIsLoading='class12';

noResults12 = false;
noResults10 = false;
noResults8 = false; 
@track Isclass12SchoolName =true; 
@track Isclass10SchoolName =true; 
@track Isclass8SchoolName =true;
@track fileFetchProcessCompleted= false;
@track fileUploadProcessCompleted = false; 
selectedStateValue='';
selectedDistrictValue='';
selectedBlockValue='';

isEductionalDetailsSubmitted;
updateProgressbarStatus;
progressValue;

@wire(CurrentPageReference)
currentPageReference;

connectedCallback(){
    this.applicationId= this.currentPageReference?.attributes?.recordId || null;
    this.fetchFiles(this.class12DocumentTypes);
}

@wire(getRecord, { recordId: '$applicationId', fields: [EXTERNAL_APPLICATION_STATUS] })
wiredApplicationId(result) {
    const { error, data } = result;
    if (data) {
        this.externalApplicationStatus = data?.fields?.Application_External_Status__c;
        if(this.externalApplicationStatus.value === 'Draft'){
            this.isDisableAcademicAllFields = false;
        }else{    
            this.isDisableAcademicAllFields = true;
        }

    } else if (error) {
        this.showToast(Error_Label,error.body.message, 'error');
    }
}


@wire(getRecord, { recordId: USER_ID, fields: [CONTACT_ID_FIELD] })
wiredUser({ error, data }) {
    if (data) {
        this.userContactId = getFieldValue(data, CONTACT_ID_FIELD); 
        this.progressPercent = getFieldValue(data, APPLICATION_PROGRESS_PERCENT)
    } else if (error) {
        this.showToast(Error_Label, error.body.message , 'error');
    }
}
isStatePicklistLoaded = false;
statePicklistPromiseResolve;

statePicklistPromise = new Promise((resolve) => {
    this.statePicklistPromiseResolve = resolve;
});
@wire(getStatePicklistValues)
wiredStatePicklistValues({ error, data }) {
    if (data) {
        this.statesOptions = Object.keys(data).map(key => ({
            Id: key,
            label: data[key],
            value: data[key]
        }));
        this.stateOptions12 = this.statesOptions;
        this.stateOptions10 = this.statesOptions;
        this.stateOptions8 = this.statesOptions;

        this.isStatePicklistLoaded = true;
        this.statePicklistPromiseResolve();
    } else if (error) {
        this.showToast(Error_Label, error.body.message , 'error');
    }
}

async fetchFiles(documentTypes) {
    this.isLoading=true;
    getFilesForRecord({documentTypes: documentTypes,appId:this.applicationId })
        .then((data) => {
            this.processFiles(data);
        })
        .catch((error) => {
            this.isLoading=false;
            this.fetchError = error.body.message;
        });
}

processFiles(data) {
    this.class12Files = [];
    this.class10Files = [];
    this.class8Files = [];

    data.forEach((file) => {
        let base64Prefix = '';
        if (file.title.endsWith('.pdf')) {
            base64Prefix = 'data:application/pdf;base64,';
        } else if (file.title.endsWith('.png')) {
            base64Prefix = 'data:image/png;base64,';
        } else if (file.title.endsWith('.jpg') || file.title.endsWith('.jpeg')) {
            base64Prefix = 'data:image/jpeg;base64,';
        } else if (file.title.endsWith('.img')) {
            base64Prefix = 'data:image/img;base64,';
        }

        const fileDataUrl = base64Prefix + file.base64Data;
        const fileDetails = {
            title: file.title,
            fileName: file.title,
            fileType: file.docType,
            base64: fileDataUrl,
            fileUrls: fileDataUrl 
        };
        

        if (file.docType === 'Class Twelve Marks Card') {
            this.class12Files = [...this.class12Files, fileDetails];
        } else if (file.docType === 'Class Ten Marks Card') {
            this.class10Files = [...this.class10Files, fileDetails];
        } else if (file.docType === 'Class Eight Marks Card') {
            this.class8Files = [...this.class8Files, fileDetails];
        }
    });
    if(this.fileUploadProcessCompleted===true && (this.classIsLoading==='class8' || this.classIsLoading==='class10')){
        this.isLoading=false;
    }else if(this.classIsLoading==='class12'){
        this.isLoading=false;
    }else{
    this.isLoading=true;
    }
    this.fileFetchProcessCompleted= true;
}

@wire(getRecord, { recordId: '$userContactId', fields: CONTACT_FIELDS })
wiredContactRecord({ error, data }) {
    this.wiredAcademicDetails = data;
    if (data) {
        this.contactRecord = data;
        this.recordTypeId = data?.recordTypeId;
        this.contactDOB = data?.fields?.Birthdate?.value;
        this.isEductionalDetailsSubmitted = data?.fields?.Is_Education_Details_Completed__c?.value;

        this.updateProgressbarStatus = data?.fields?.Application_Forms_Progress_Percent__c?.value;


        if (this.isStatePicklistLoaded) {
                    this.loadContactDetails(this.contactRecord);
                } else {
                    this.statePicklistPromise.then(() => {
                        this.loadContactDetails(this.contactRecord);
                    });
                }         
        this.handleConditionalRendering();
    } else if (error) {
        this.showToast(Error_Label, error.body.message , 'error');
    }
}


@wire(getPicklistValues, { recordTypeId:'$recordTypeId', fieldApiName: MODE_OF_EDUCATION_OPTIONS })
wiredPicklistValues({ error, data }) {
    if (data) {
        this.modeOfEducationOptions = data.values;
    } else if (error) {
        this.showToast(Error_Label, error.body.message , 'error');
    }
}

@wire(getPicklistValues, { recordTypeId:'$recordTypeId', fieldApiName: CLASS_TWELVE_BOARD_NAME })
wiredBoardNamePicklistValues({ error, data }) {
    if (data) {
        this.boardNameOptions = data.values;
    } else if (error) {
        this.showToast(Error_Label, error.body.message , 'error');
    }
}

loadContactDetails(data) {
    this.class12BoardName = data?.fields?.Class_Twelve_Board_Name__c?.value;
    if(this.class12BoardName){
        if(this.isDisableAcademicAllFields === false){
            this.isBlock12Selected = false;
        }
    }
    this.otherClass12BoardName = data?.fields?.Class_Twelve_Other_Board_Name__c?.value;
    this.class12ModeOfEducation = data?.fields?.Class_Twelve_Education_Mode__c?.value;
    this.isClass12ModeOfEducationRegular = this.class12ModeOfEducation === 'Regular';
    this.class12ExamState = data?.fields?.Class_Twelve_Exam_Centre_State__c?.value;
    if (this.class12ExamState) {
        const stateOption = this.statesOptions.find(option => option.value === this.class12ExamState);
        this.selectedStateId = stateOption ? stateOption.Id : '';
        if (this.selectedStateId) {
            this.loadDistrictPicklistValues(this.selectedStateId, 12)
                .then(() => {
                    this.class12ExamDistrict = data?.fields?.Class_Twelve_Exam_Centre_District__c?.value;
                    if (this.class12ExamDistrict) {
                        if(this.isDisableAcademicAllFields === false){
                            this.isState12Selected=false;
                        }
                        const distOption = this.districtsOptions12.find(option => option.value === this.class12ExamDistrict);
                        const selectedDistrictId = distOption ? distOption.Id : '';
                        if (selectedDistrictId) {
                            this.loadBlockPicklistValues(selectedDistrictId, 12)
                                .then(() => {
                                    this.class12ExamBlock = data?.fields?.Class_Twelve_Exam_Center_Block__c?.value;
                                    this.class12SchoolName = data?.fields?.Class_Twelve_Name_Of_School__c?.value;
                                    if (this.class12SchoolName) {
                                        const classNumber = 12;
                                        this.loadSchoolPicklistValues(this.class12ExamState, this.class12ExamDistrict, this.class12ExamBlock, classNumber);
                                        if(this.isDisableAcademicAllFields === false){
                                            this.Isclass12SchoolName = false;
                                        }
                                        this.isOtherClass12SchoolName = this.class12SchoolName === 'Others';
                                    }
                                });
                        }
                    }
                });
        }
    }
    this.class12Pincode = data?.fields?.Class_Twelve_Exam_Centre_Pincode__c?.value;
    this.class12ExamBlock = data?.fields?.Class_Twelve_Exam_Center_Block__c?.value;
    if (this.class12ExamBlock) {
        this.filteredBlockOptions12 = [{ label: this.class12ExamBlock, value: this.class12ExamBlock }];
        if(this.isDisableAcademicAllFields === false){
            this.isDistrict12Selected = false;
        }
    }
    this.class12otherSchoolName = data?.fields?.Class_Twelve_Other_Name_Of_School__c?.value;
    this.class12Percentage = data?.fields?.Class_Twelve_Pass_Percentage__c?.value;
    this.class12YearOfPassing = data?.fields?.Class_Twelve_Year_Of_Passing__c?.value;
    if (this.fileNames.length > 0) {
        this.class8FileName = this.fileNames[0];
        this.class10FileName = this.fileNames[1];
        this.class12FileName = this.fileNames[2];
    }
}
loadContactDetails10(data){
    console.log('Loading class 10 data');
    this.class10BoardName = data?.fields?.Class_Ten_Board_Name__c?.value;
    if(this.class10BoardName){
        if(this.isDisableAcademicAllFields === false){
            this.isBlock10Selected = false;
        }
    }
    this.otherClass10BoardName = data?.fields?.Class_Ten_Other_Board_Name__c?.value;
    this.class10ModeOfEducation = data?.fields?.Class_Ten_Education_Mode__c?.value;
    this.isClass10ModeOfEducationRegular = this.class10ModeOfEducation === 'Regular';
    this.class10Pincode = data?.fields?.Class_Ten_Exam_Centre_Pincode__c?.value;
    this.class10ExamState = data?.fields?.Class_Ten_Exam_Centre_State__c?.value;
    if (this.class10ExamState) {
        const stateOption = this.statesOptions.find(option => option.value === this.class10ExamState);
        this.selectedStateId = stateOption ? stateOption.Id : '';
        if (this.selectedStateId) {
            this.loadDistrictPicklistValues(this.selectedStateId, 10)
                .then(() => {
                    this.class10ExamDistrict = data?.fields?.Class_Ten_Exam_Centre_District__c?.value;
                    if (this.class10ExamDistrict) {
                        if(this.isDisableAcademicAllFields === false){
                                this.isState10Selected = false;
                        }
                        const distOption = this.districtsOptions10.find(option => option.value === this.class10ExamDistrict);
                        const selectedDistrictId = distOption ? distOption.Id : '';
                        if (selectedDistrictId) {
                            this.loadBlockPicklistValues(selectedDistrictId, 10)
                                .then(() => {
                                    this.class10ExamBlock = data?.fields?.Class_Ten_Exam_Center_Block__c?.value;
                                    this.class10SchoolName = data?.fields?.Class_Ten_Name_Of_School__c?.value;
                                    if (this.class10SchoolName) {
                                        const classNumber = 10;
                                        this.loadSchoolPicklistValues(this.class10ExamState, this.class10ExamDistrict, this.class10ExamBlock, classNumber);
                                        if(this.isDisableAcademicAllFields === false){
                                            this.Isclass10SchoolName = false;
                                        }
                                        this.isOtherClass10SchoolName = this.class10SchoolName === 'Others';
                                    }
                                });
                        }
                    }
                });
        }
    }
    this.class10ExamBlock = data?.fields?.Class_Ten_Exam_Center_Block__c?.value;
    if (this.class10ExamBlock) {
        this.filteredBlockOptions10 = [{ label: this.class10ExamBlock, value: this.class10ExamBlock }];
        if(this.isDisableAcademicAllFields === false){
            this.isDistrict10Selected = false;
        }
    }
    this.class10otherSchoolName = data?.fields?.Class_Ten_Other_Name_Of_School__c?.value;
    this.class10Percentage = data?.fields?.Class_Ten_Pass_Percentage__c?.value;
    this.class10YearOfPassing = data?.fields?.Class_Ten_Year_Of_Passing__c?.value;
}
loadContactDetails8(data){
    this.class8YearOfPassing = data?.fields?.Class_Eight_Year_Of_Passing__c?.value;
    this.class8ModeOfEducation = data?.fields?.Class_Eight_Education_Mode__c?.value;
    this.isClass8ModeOfEducationRegular = this.class8ModeOfEducation === 'Regular';
    this.isOtherClass8SchoolName = this.isClass8ModeOfEducationRegular;
    this.class8BoardName = data?.fields?.Class_Eight_Board_Name__c?.value;
    if(this.class8BoardName){
        if(this.isDisableAcademicAllFields === false){
            this.isBlock8Selected = false;
        }
    } 
    this.otherClass8BoardName = data?.fields?.Class_Eight_Other_Board_Name__c?.value;
    this.class8ExamState = data?.fields?.Class_Eight_Exam_Centre_State__c?.value;
    if (this.class8ExamState) {
        const stateOption = this.statesOptions.find(option => option.value === this.class8ExamState);
        this.selectedStateId = stateOption ? stateOption.Id : '';
        if (this.selectedStateId) {
            this.loadDistrictPicklistValues(this.selectedStateId, 8)
                .then(() => {
                    this.class8ExamDistrict = data?.fields?.Class_Eight_Exam_Centre_District__c?.value;
                    if (this.class8ExamDistrict) {
                        if(this.isDisableAcademicAllFields === false){
                            this.isState8Selected = false;
                        }
                        const distOption = this.districtsOptions8.find(option => option.value === this.class8ExamDistrict);
                        const selectedDistrictId = distOption ? distOption.Id : '';
                        if (selectedDistrictId) {
                            this.loadBlockPicklistValues(selectedDistrictId, 8)
                                .then(() => {
                                    this.class8ExamBlock = data?.fields?.Class_Eight_Exam_Center_Block__c?.value;
                                    if(this.isDisableAcademicAllFields === false){
                                        this.isDistrict8Selected = false;
                                    }
                                    this.class8SchoolName = data?.fields?.Class_Eight_Name_Of_School__c?.value;
                                    if (this.class8SchoolName) {
                                        const classNumber = 8;
                                        this.loadSchoolPicklistValues(this.class8ExamState, this.class8ExamDistrict, this.class8ExamBlock, classNumber);
                                        if(this.isDisableAcademicAllFields === false){
                                            this.Isclass8SchoolName = false;
                                        }
                                        this.isOtherClass8SchoolName = this.class8SchoolName === 'Others';
                                    }
                                });
                        }
                    }
                });
        }
    }
    this.class8Pincode = data?.fields?.Class_Eight_Exam_Centre_Pincode__c?.value;
    this.class8otherSchoolName = data?.fields?.Class_Eight_Other_Name_Of_School__c?.value;
    this.class8Percentage = data?.fields?.Class_Eight_Pass_Percentage__c?.value;
}


handleConditionalRendering() {
    this.isClass8ModeOfEducationRegular = this.class8ModeOfEducation === 'Regular';
    this.isClass8ModeOfEducationDistance = this.class8ModeOfEducation === 'Distance';

    this.isClass10ModeOfEducationRegular = this.class10ModeOfEducation === 'Regular';
    this.isClass10ModeOfEducationDistance = this.class10ModeOfEducation === 'Distance';

    this.isClass12ModeOfEducationRegular = this.class12ModeOfEducation === 'Regular';
    this.isClass12ModeOfEducationDistance = this.class12ModeOfEducation === 'Distance';

    if(this.isDisableAcademicAllFields === true){
        this.isState8Selected === true;
        this.isDistrict8Selected === true;
        this.isBlock8Selected === true;

        this.isState10Selected === true;
        this.isDistrict10Selected === true;
        this.isBlock10Selected === true;

        this.isState12Selected === true;
        this.isDistrict12Selected === true;
        this.isBlock12Selected === true;
        this.isAadhaar === true;

    }else{
    this.isAadhaar === false;

    }

    this.isPincode8Selected = this.class8Pincode === null;
    this.isPincode10Selected = this.class10Pincode === null;
    this.isPincode12Selected = this.class12Pincode === null;

    this.isOtherClass8SchoolName = this.class8SchoolName === 'Others';//class8SchoolName
    this.isOtherClass10SchoolName = this.class10SchoolName === 'Others';
    this.isOtherClass12SchoolName = this.class12SchoolName === 'Others';

    this.isOtherClass8BoardName = this.class8BoardName === 'Others';
    this.isOtherClass10BoardName = this.class10BoardName === 'Others';
    this.isOtherClass12BoardName = this.class12BoardName === 'Others';

}

get acceptedFormats() {
    return ['.pdf', '.png','.jpg','.jpeg','.img'];
}
async handleNext(event) {
    const fieldName = event.target.name.trim();
    this.scrollToTop();
    try {
        if (fieldName === 'class12Next') {
            const isFormValid = this.validateClass12Fields();
            if (isFormValid) {
                this.fileFetchProcessCompleted=false;
                this.fileUploadProcessCompleted =false;
                this.isLoading = true;
                this.classIsLoading='class10';
                this.class10ExamDistrict='';
                await this.updateClass12Contact();
                await this.uploadAllFileDetails([this.class12FilesNew]);
                await this.fetchFiles(this.class10DocumentTypes);
                this.loadContactDetails10(this.contactRecord);
                this.class12Section = false;
                this.class10Section = true;
                this.class8Section = false;
            }
        } else if (fieldName === 'class10Next') {
            const isFormValid = this.validateClass10Fields();
            if (isFormValid) {
                this.fileFetchProcessCompleted=false;
                this.fileUploadProcessCompleted =false;
                this.isLoading = true;
                this.classIsLoading='class8';
                this.class8ExamDistrict='';
                await this.updateClass10Contact();
                await this.uploadAllFileDetails([this.class10FilesNew]);
                await this.fetchFiles(this.class8DocumentTypes);
                this.loadContactDetails8(this.contactRecord);
                this.class12Section = false;
                this.class10Section = false;
                this.class8Section = true;
            }
        }
    } catch (error) {
    } finally {
    }
}
async handleBack(event) {
    const fieldName = event.target.name.trim();
    this.scrollToTop(); 
    this.isLoading = true; 
    
    try {
        await this.loadContactYearDetails(this.wiredAcademicDetails); 
        if (fieldName === 'class8Back') {
            this.fileUploadProcessCompleted =true;
            this.classIsLoading='class10';
            this.class8FilesNew=[];
            this.class8Files=[];
            await this.fetchFiles(this.class10DocumentTypes);
            this.class12Section = false;
            this.class10Section = true;
            this.class8Section = false;
        } else if (fieldName === 'class10Back') {
            this.fileUploadProcessCompleted =true;
            this.classIsLoading='class12';
            this.class10FilesNew=[];
            this.class10Files=[];
            await this.fetchFiles(this.class12DocumentTypes);
            this.class12Section = true;
            this.class10Section = false;
            this.class8Section = false;
        }
    } catch (error) {
    } finally {
    }
}



loadContactYearDetails(data) {
    this.class8YearOfPassing = data?.fields?.Class_Eight_Year_Of_Passing__c?.value;
    this.class10YearOfPassing = data?.fields?.Class_Ten_Year_Of_Passing__c?.value;
    this.class12YearOfPassing = data?.fields?.Class_Twelve_Year_Of_Passing__c?.value;
}
handleChange(event) {
    const fieldName = event.target.name.trim(); 
    this[fieldName] = event.target.value.replace(/\s+/g, ' ').trim(); 

    event.target.setCustomValidity('');
    event.target.reportValidity();

    this.handleClass12Status(fieldName);
    this.handlePincode(fieldName, event);
    this.handleYearOfPassing(fieldName, event);
    this.handlePassPercentage(fieldName, event);
    this.handleModeOfEducation(fieldName, event);
    this.handleSchoolAndBoardName(fieldName);
    this.handleStateChange(event);
    this.handleDistrictChange(event);
    this.handleBlockChange(event);
    this.validateAlphabeticInput(fieldName, event);
    this.handleOtherSchoolAndBoard(fieldName, event);        

    if (this.errors[fieldName]) {
        delete this.errors[fieldName];
    }
}
check12ClassFields() {
    const fields = {
        class12YearOfPassing: this.class12YearOfPassing,
        class12ModeOfEducation: this.class12ModeOfEducation,
        class12ExamState: this.class12ExamState,
        class12ExamDistrict: this.class12ExamDistrict,
        class12ExamBlock: this.class12ExamBlock,
        class12SchoolName: this.class12SchoolName,
        class12BoardName: this.class12BoardName,
        class12Percentage: this.class12Percentage
    };

    let allFieldsFilled = true;

    Object.keys(fields).forEach(field => {
        if (
            (field === 'class12SchoolName' || field === 'class12BoardName') &&
            (fields['class12SchoolName'] || fields['class12BoardName'])
        ) {
            return;
        }

        if (!fields[field]) {
            allFieldsFilled = false;
        }
    });

    return allFieldsFilled;
}
check10ClassFields() {
    const fields = {
        class10YearOfPassing: this.class10YearOfPassing,
        class10ModeOfEducation: this.class10ModeOfEducation,
        class10ExamState: this.class10ExamState,
        class10ExamDistrict: this.class10ExamDistrict,
        class10ExamBlock: this.class10ExamBlock,
        class10SchoolName: this.class10SchoolName,
        class10BoardName: this.class10BoardName,
        class10Percentage: this.class10Percentage
    };

    let allFields10Filled = true;

    Object.keys(fields).forEach(field => {
        if (
            (field === 'class10SchoolName' || field === 'class10BoardName') &&
            (fields['class10SchoolName'] || fields['class10BoardName'])
        ) {
            return;
        }

        if (!fields[field]) {
            allFields10Filled = false;
        }
    });

    return allFields10Filled;
}


handleOtherSchoolAndBoard(fieldName, event){
    const field = fieldName;
    const value = event.target.value;

    if ((field === 'otherClass12BoardName' || 
            field === 'otherClass10BoardName' || 
            field === 'class12otherSchoolName' || 
            field === 'class10otherSchoolName') && 
            (value == null || value === '')) {

        event.target.setCustomValidity(Complete_This_Field_Label);
    } else {
    }
        event.target.reportValidity();
}

        selectSchool(event) {
            const selectedValue = event.detail.value;
            const fieldName = event.target.name.trim();
            const classNumber = this.extractClassNumber(fieldName);
        
            const schoolNameProp = `class${classNumber}SchoolName`;
            const selectedValueProp = `selectedValue${classNumber}`;
            const noResultsProp = `noResults${classNumber}`;
            const isOtherSchoolNameProp = `isOtherClass${classNumber}SchoolName`;
            const otherSchoolNameProp = `class${classNumber}otherSchoolName`;
        
            this[selectedValueProp] = selectedValue;
            this[schoolNameProp] = selectedValue;
            this[noResultsProp] = false;
            this[isOtherSchoolNameProp] = (this[schoolNameProp] === 'Others');
            if (selectedValue !== 'Others') {
                this[otherSchoolNameProp] = null;
            }
            event.target.setCustomValidity('');
            event.target.reportValidity();
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
        this[`Isclass${classNumber}SchoolName`] = true;
        this[`isDistrict${classNumber}Selected`] = true;
        this[`isDistrict${classNumber}Selected`]=true;
        this[`isBlock${classNumber}Selected`] = true;
        
        this[`class${classNumber}BoardName`]=''
        this[`otherClass${classNumber}BoardName`]=''
        this[`isOtherClass${classNumber}BoardName`] = false;
        this[`isOtherClass${classNumber}SchoolName`] = false;


        this[`class${classNumber}ExamState`] = event.target.value;

        const selectedOption = this.statesOptions.find(option => option.value === selectedValue);
        this.selectedStateId = selectedOption.Id;

        this.loadDistrictPicklistValues(this.selectedStateId, classNumber);
        this[`isState${classNumber}Selected`] = false;

    }
}

loadDistrictPicklistValues(StateId, classNumber) {
return getDistrictPicklistValues({ stateId: StateId })  // Return the promise
    .then(result => {
        const districtOptions = Object.keys(result).map(key => ({
            Id: key,
            label: result[key],
            value: result[key]
        }));
        this[`districtsOptions${classNumber}`] = districtOptions;
    })
    .catch(error => {
        this.showToast(Error_Label, error.body.message, 'error');
    });
}

handleDistrictChange(event) {
    const fieldName = event.target.name.trim();
    const selectedValue = event.detail.value;
    const classNumber = this.extractClassNumber(fieldName);

    if (fieldName === `class${classNumber}ExamDistrict`) {  
        this[`class${classNumber}ExamBlock`] =''
        this[`class${classNumber}SchoolName`]=''
        this[`class${classNumber}otherSchoolName`]=''
        this[`Isclass${classNumber}SchoolName`] = true;
        this[`isBlock${classNumber}Selected`] = false;
        this[`isOtherClass${classNumber}SchoolName`] = false;

        this[`class${classNumber}BoardName`]=''
        this[`otherClass${classNumber}BoardName`]=''
        this[`isOtherClass${classNumber}BoardName`] = false;

        this[`class${classNumber}ExamDistrict`] = event.target.value;

        const selectedOption = this[`districtsOptions${classNumber}`].find(option => option.value === selectedValue);
        this.selectedDistrictId = selectedOption.Id;

        this.loadBlockPicklistValues(this.selectedDistrictId, classNumber);
        this[`isDistrict${classNumber}Selected`] = false;
    }
}

loadBlockPicklistValues(DistId, classNumber) {
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

handleBlockChange(event) {
    const fieldName = event.target.name.trim();
    const classNumber = this.extractClassNumber(fieldName);
    const selectedValue = event.detail.value;

    if (fieldName === `class${classNumber}ExamBlock`) {
        this[`class${classNumber}SchoolName`] = '';
        this[`class${classNumber}ExamBlock`] = selectedValue;
        this.selectedBlockName = this[`class${classNumber}ExamBlock`];
        this[`isOtherClass${classNumber}SchoolName`] = false;
        this[`class${classNumber}BoardName`] = '';
        this[`otherClass${classNumber}BoardName`] = '';
        this[`otherClass${classNumber}BoardName`] = '';
        this[`class${classNumber}otherSchoolName`] = '';
        const selectedOption = this[`filteredBlockOptions${classNumber}`].find(option => option.value === selectedValue);
        this.selectedExamBlockId = selectedOption.Id;
        this.selectedStateValue = this[`class${classNumber}ExamState`];
        this.selectedDistrictValue = this[`class${classNumber}ExamDistrict`];
        this.selectedBlockValue = this[`class${classNumber}ExamBlock`];
        this.loadSchoolPicklistValues(this.selectedStateValue, this.selectedDistrictValue, this.selectedBlockValue, classNumber); 
        this[`isBlock${classNumber}Selected`] = false;
        this[`Isclass${classNumber}SchoolName`] = false;
    }
}

loadSchoolPicklistValues(state, district, block, classNumber) {
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
        this.showToast(Error_Label, error.body.message, 'error');
    });
}

handleDragOver(event){
    event.dataTransfer.dropEffect='none';
}


extractClassNumber(fieldName) {
    const match = fieldName.match(/\d+/);
    return match ? match[0] : null;
}

handleClass12Status(fieldName) {
    if (fieldName === 'class12Status') {
        this.is12Pass = this[fieldName] === 'Yes';
    }
}
validateAlphabeticInput(fieldName, event){
    const field=fieldName;
    const value =event.target.value;


}

handleBeforeInput(event) {
    let allowedPattern = /^[a-zA-Z\s.,'()\/]*$/;

    let newValue = event.target.value + (event.data || '');
        if (!allowedPattern.test(newValue)) {
        event.preventDefault();
    }
}
handlePinBeforeInput(event){
    const pattern = /^[0-9]*$/;

        let inputChar = event.data || '';
        if (!pattern.test(inputChar)) {
            event.preventDefault();
        }
}
handlePerBeforeInput(event) {
    const inputChar = event.data || '';  
    const currentValue = event.target.value; 
        if (event.inputType === "deleteContentBackward" || event.inputType === "deleteContentForward") {
        return; 
    }
    const selectionStart = event.target.selectionStart;
    const selectionEnd = event.target.selectionEnd;
    const newValue = currentValue.slice(0, selectionStart) + inputChar + currentValue.slice(selectionEnd);

    const pattern = /^[0-9]*\.?[0-9]*$/;

    if (!pattern.test(newValue) || newValue.startsWith('.')) {
        event.preventDefault();
    }
}


handlePincode(fieldName, event) {

    if (fieldName === 'class8pincode' || fieldName === 'class10pincode' || fieldName === 'class12pincode') {
            const classNumber = this.extractClassNumber(fieldName);
            this[`class${classNumber}Pincode`] =event.target.value;

        if (!/^[0-9]{6}$/.test(this[fieldName])) {
            event.target.setCustomValidity(Pin_code_should_be_exactly_6_digits_label);
        }
        if (event.target.value.length === 0 ) {
            event.target.setCustomValidity("");
        }
        if (event.target.value.length > 0 && event.target.value.length < 6) {
            event.target.setCustomValidity(Pin_code_should_be_exactly_6_digits_label);
        }
        else {
            event.target.setCustomValidity("");
        }
        event.target.reportValidity();
    }
}

handleYearOfPassing(fieldName, event) {
    const currentYear = new Date().getFullYear();

    const yearValue = parseInt(event.target.value, 10);
    const parsedYearValue = Number(yearValue);

    if (fieldName === 'class12YearOfPassing') {
        const class8YearValue = parseInt(this.class8YearOfPassing, 10);
        const class10YearValue = parseInt(this.class10YearOfPassing, 10);


        if (yearValue == null || yearValue === '' || isNaN(parsedYearValue) ) {
            event.target.setCustomValidity(Complete_This_Field_Label);
        } 
        else if (!/^[0-9]{4}$/.test(yearValue)) {
            event.target.setCustomValidity(Less_Than_4_Digits_Error_Label);
        } 
        else if (yearValue > currentYear) {
            event.target.setCustomValidity(Future_Year_Error_Label);
        } else if (yearValue < 1990) {
            event.target.setCustomValidity(Less_Than_1990_Label);
        }
        else if (yearValue <= class8YearValue) {
            event.target.setCustomValidity(X12_same_as_8_Error_Label);
        } 
        else if (yearValue < class8YearValue + 4) {
            event.target.setCustomValidity(X12_As_2022_Class_8_As_2021_Label);
        } 
        else if (yearValue <= class10YearValue) {
            event.target.setCustomValidity(X12_Same_As_10_Erro_Label);
        } 
        else if (yearValue === class10YearValue) {
            event.target.setCustomValidity("The year of passing for Class 12 should not be same as class 10.");
        } 
        else if (yearValue === class8YearValue) {
            event.target.setCustomValidity("The year of passing for Class 12 should not be same as class 8.");
        } 
        else if (yearValue < class10YearValue + 2) {
            event.target.setCustomValidity(X12_As_2022_Class_10_as_2021_Label);
        } 
        else {
            event.target.setCustomValidity("");
        }
        event.target.reportValidity();
    }
        else if (fieldName === 'class10YearOfPassing') {
        const class8YearValue = parseInt(this.class8YearOfPassing, 10);
        const class12YearValue = parseInt(this.class12YearOfPassing, 10);

        if (yearValue == null || yearValue === '' || isNaN(parsedYearValue) ) {
            event.target.setCustomValidity(Complete_This_Field_Label);
        }
        else if (!/^[0-9]{4}$/.test(yearValue)) {
            event.target.setCustomValidity(Less_Than_4_Digits_Error_Label);
        } 
        else if (yearValue === class8YearValue) {
            event.target.setCustomValidity(X10_Same_As_8_Error_Label);
        } 
        else if (yearValue === class12YearValue) {
            event.target.setCustomValidity(X10_Same_As_12_Error_Label);
        }
        else if (yearValue < class8YearValue + 2) {
            event.target.setCustomValidity(X10_Gap_8_Label);
        } 
        else if (yearValue > class12YearValue - 2) {
            event.target.setCustomValidity(X10As12_Label);
        } 
        else if (yearValue > currentYear) {
            event.target.setCustomValidity(Future_Year_Error_Label);
        } 
        else {
            event.target.setCustomValidity("");
        }
        event.target.reportValidity();

    } else if (fieldName === 'class8YearOfPassing' ) {
        if (this.class8YearOfPassing!==null){
        const class10YearValue = parseInt(this.class10YearOfPassing, 10);
        const class12YearValue = parseInt(this.class12YearOfPassing, 10);
        if (yearValue == null || yearValue === '' || isNaN(parsedYearValue) ) {
            event.target.setCustomValidity("");
        }

        else if (!/^[0-9]{4}$/.test(yearValue)) {
            event.target.setCustomValidity(Less_Than_4_Digits_Error_Label);
        } 
        else if (yearValue === class10YearValue) {
            event.target.setCustomValidity(X8_Same_As_10_Error_Label);
        } 
        else if (yearValue === class12YearValue) {
            event.target.setCustomValidity(X8_Same_As_12_Error_Label);
        } 
        else if (yearValue >= class10YearValue - 1) {
            event.target.setCustomValidity(X8_As_2023_Class_10_As_2022_Label);
        }
        else if (yearValue >= class12YearValue - 3) {
            event.target.setCustomValidity(X8_As_2023_Class_12_As_2022_Label);
        } 
        else if (yearValue > currentYear) {
            event.target.setCustomValidity(Future_Year_Error_Label);
        } 
        else {
            event.target.setCustomValidity("");
        }
        event.target.reportValidity();
    }

    }
    
} 

handlePassPercentage(fieldName, event) {
    if (fieldName === 'class8Percentage' || fieldName === 'class10Percentage' || fieldName === 'class12Percentage') {
        const percentage = parseFloat(this[fieldName]);
        if ((percentage == null || percentage === '' || isNaN(percentage)) && fieldName !== 'class8Percentage') {
            event.target.setCustomValidity(Complete_This_Field_Label);
        } 
        else if (percentage < 33 || percentage > 100) {
            event.target.setCustomValidity(Less_Than_33_Error_Label);
        } else {
            event.target.setCustomValidity("");
        }
        event.target.reportValidity();
    }
}

handleModeOfEducation(fieldName,event) {
    if (fieldName === 'class8ModeOfEducation') {
        this.isClass8ModeOfEducationRegular = this[fieldName] === 'Regular';
        this.isClass8ModeOfEducationDistance = this[fieldName] === 'Distance';

        if (this.isClass8ModeOfEducationRegular || this.isClass8ModeOfEducationDistance) {
            this.districtsOptions8 = [];
            this.filteredSchoolNameOptions8 = [];
            this.filteredBlockOptions8 = [];
            this.class8SchoolName='';
            this.class8BoardName='';
            this.class8otherSchoolName='';
            this.otherClass8BoardName='';
            this.class8ExamState='';
            this.class8BoardName='';
            this.class8ExamDistrict='';
            this.class8ExamBlock='';


            this.isDistrict8Selected=true;
            this.Isclass8SchoolName=true;
            this.isOtherClass8SchoolName=false;
            this.isState8Selected=true;
            this.isBlock8Selected=true;
            this.isOtherClass8BoardName=false;

        }
    } else if (fieldName === 'class10ModeOfEducation') {
        this.isClass10ModeOfEducationRegular = this[fieldName] === 'Regular';
        this.isClass10ModeOfEducationDistance = this[fieldName] === 'Distance';

        if (this.isClass10ModeOfEducationRegular || this.isClass10ModeOfEducationDistance) {
            this.districtsOptions10 = [];
            this.filteredSchoolNameOptions10 = [];
            this.filteredBlockOptions10 = [];
            this.class10SchoolName='';
            this.class10ExamDistrict='';
            this.class10BoardName='';
            this.class10otherSchoolName='';
            this.otherClass10BoardName='';
            this.class10ExamState='';
            this.class10BoardName='';
            this.class10ExamBlock='';


            this.isDistrict10Selected=true;
            this.Isclass10SchoolName=true;
            this.isOtherClass10SchoolName=false;
            this.isState10Selected=true;
            this.isBlock10Selected=true;
            this.isOtherClass10BoardName=false;



        }
    } else if (fieldName === 'class12ModeOfEducation') {
        this.isClass12ModeOfEducationRegular = this[fieldName] === 'Regular';
        this.isClass12ModeOfEducationDistance = this[fieldName] === 'Distance';

        if (this.isClass12ModeOfEducationRegular || this.isClass12ModeOfEducationDistance) {
            this.districtsOptions12 = [];
            this.filteredSchoolNameOptions12 = [];
            this.filteredBlockOptions12 = [];
            this.class12SchoolName='';
            this.class12BoardName='';
            this.class12otherSchoolName='';
            this.otherClass12BoardName='';
            this.class12ExamState='';
            this.class12BoardName='';
            this.class12ExamDistrict='';
            this.class12ExamBlock='';

            this.isDistrict12Selected=true;
            this.Isclass12SchoolName=true;
            this.isOtherClass12SchoolName=false;
            this.isState12Selected=true;
            this.isBlock12Selected=true;
            this.isOtherClass12BoardName=false;
        }
    }
}


handleSchoolAndBoardName(fieldName) {
    if (fieldName === 'class8SchoolName') {
        this.isOtherClass8SchoolName = this[fieldName] === 'Others';
        this.isOtherClass8BoardName = false;
    } else if (fieldName === 'class10SchoolName') {
        this.isOtherClass10SchoolName = this[fieldName] === 'Others';
        this.isOtherClass10BoardName = false;
    } else if (fieldName === 'class12SchoolName') {
        this.isOtherClass12SchoolName = this[fieldName] === 'Others';
        this.isOtherClass12BoardName = false;
    } else if (fieldName === 'class8BoardName') {
        this.isOtherClass8BoardName = this[fieldName] === 'Others';
        this.isOtherClass8SchoolName = false;
        if(this[fieldName] !== 'Others'){
            this.otherClass8BoardName='';
        }
    } else if (fieldName === 'class10BoardName') {
        this.isOtherClass10BoardName = this[fieldName] === 'Others';
        this.isOtherClass10SchoolName = false;
        if(this[fieldName] !== 'Others'){
            this.otherClass10BoardName='';
        }
    } else if (fieldName === 'class12BoardName') {
        this.isOtherClass12BoardName = this[fieldName] === 'Others';
        this.isOtherClass12SchoolName = false;
        if(this[fieldName] !== 'Others'){
            this.otherClass12BoardName='';
        }
    }
}

handleYearOfPassingValidation(event) {
    const inputValue = event.target.value.trim(); 
        const regex = /^[0-9]$/;    
        if (!regex.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab') {
            event.preventDefault();
            return; 
        }
        if (event.key === 'Backspace') {                
            event.target.setCustomValidity('');
            return;
        }        
        if (inputValue.length >= 4) {
            event.preventDefault(); 
            return;
        }        
        if (inputValue.length > 3) {
                    event.target.setCustomValidity('');

        } else if(inputValue.length <= 3 || yearValue < 1990 || yearValue > 2027){
            
            const percentageErrorMessage = "You must enter valid year, year must be between 1990 and 2027.";
            event.target.setCustomValidity(percentageErrorMessage);
        }
        else{
            event.target.setCustomValidity('');
        }
}
@track class8Files = [];
@track class10Files = [];
@track class12Files = [];
@track class8FilesNew = [];
@track class10FilesNew = [];
@track class12FilesNew = [];

handleUploadFile(event) {
    const files = event.target.files;
    const maxSizeBytes = 1048576; // 1.5MB limit
    const fieldName = event.target.label;
    event.target.setCustomValidity('');
    event.target.reportValidity();

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.size > maxSizeBytes) {
            event.target.setCustomValidity(File_Size_Error_CustomLabel);
            event.target.reportValidity();
            event.target.value = null;
            return;
        }

        if (file && (file.type === 'application/pdf' || file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg')) {
            const fileExtension = file.name.split('.').pop();
            const baseFileName = file.name.split('.').slice(0, -1).join('.');
            let availableNumbers = [1, 2, 3];
            let usedNumbers = [];
            let nextNumber;

            const reader = new FileReader();
            reader.onload = () => {
                let newFiles = [];

                switch (fieldName) {
                    case 'Attach Class 8 Marksheet':
                        usedNumbers = this.class8Files.map(file => parseInt(file.title.split('_').pop().split('.')[0]));
                        nextNumber = availableNumbers.find(num => !usedNumbers.includes(num));
                        if (!nextNumber || nextNumber==='undefined') {
                            this.showToast(Error_Label, More_Than_3_Files_Error_Label, 'error');
                            event.target.value = null;
                            return;
                        }
                        newFiles = [{
                            title: `${baseFileName}_${nextNumber}.${fileExtension}`,
                            fileName: `${baseFileName}_${nextNumber}.${fileExtension}`,
                            fileType: 'Class Eight Marks Card',
                            fileBase64: reader.result.split(',')[1],
                            fileUrls: reader.result
                        }];
                        this.class8FilesNew = [...this.class8FilesNew, ...newFiles];
                        this.class8Files = [...this.class8Files, ...newFiles];
                        break;

                    case 'Attach Class 10 Marksheet':
                        usedNumbers = this.class10Files.map(file => parseInt(file.title.split('_').pop().split('.')[0]));
                        nextNumber = availableNumbers.find(num => !usedNumbers.includes(num));

                        if (!nextNumber || nextNumber==='undefined') {
                            this.showToast(Error_Label, More_Than_3_Files_Error_Label, 'error');
                            event.target.value = null;
                            return;
                        }
                        newFiles = [{
                            title: `${baseFileName}_${nextNumber}.${fileExtension}`,
                            fileName: `${baseFileName}_${nextNumber}.${fileExtension}`,
                            fileType: 'Class Ten Marks Card',
                            fileBase64: reader.result.split(',')[1],
                            fileUrls: reader.result
                        }];
                        this.class10FilesNew = [...this.class10FilesNew, ...newFiles];
                        this.class10Files = [...this.class10Files, ...newFiles];
                        break;

                    case 'Attach Class 12 Marksheet':
                        usedNumbers = this.class12Files.map(file => parseInt(file.title.split('_').pop().split('.')[0]));
                        nextNumber = availableNumbers.find(num => !usedNumbers.includes(num));
                        if (!nextNumber || nextNumber==='undefined') {
                            this.showToast(Error_Label, More_Than_3_Files_Error_Label, 'error');
                            event.target.value = null;
                            return;
                        }
                        newFiles = [{
                            title: `${baseFileName}_${nextNumber}.${fileExtension}`,
                            fileName: `${baseFileName}_${nextNumber}.${fileExtension}`,
                            fileType: 'Class Twelve Marks Card',
                            fileBase64: reader.result.split(',')[1],
                            fileUrls: reader.result
                        }];
                        this.class12FilesNew = [...this.class12FilesNew, ...newFiles];
                        this.class12Files = [...this.class12Files, ...newFiles];
                        break;
                }

                event.target.setCustomValidity('');
                event.target.reportValidity();
            };
            reader.readAsDataURL(file);
        } else {
            this.showToast(Error_Label, Invalid_file_type_error_custom_label, 'error');
            event.target.value = null;
            return;
        }
    }
}




handlePreviewFile(event) {
    const fileType = event.target.dataset.filetype;
    const fileName = event.target.dataset.id;

    let file;
    switch (fileType) {
        case 'class8':
            file = this.class8Files.find(e => e.title === fileName);
            break;
        case 'class10':
            file = this.class10Files.find(e => e.title === fileName);
            break;
        case 'class12':
            file = this.class12Files.find(e => e.title === fileName);
            break;
    }

    if (!file || !file.fileUrls) {
        this.showToast(Error_Label, 'File URL not found', 'error');
        return;
    }

    try {
        const fileUrl = file.fileUrls;
        if (fileUrl.startsWith('data:image/jpeg;base64,') || fileUrl.startsWith('data:image/png;base64,') || fileUrl.startsWith('data:image/jpg;base64,')) {
            // Handle image preview
            const imageUrl = fileUrl;
            const newTab = window.open();
            newTab.document.body.innerHTML = `<img src="${imageUrl}" style="width:100%;height:auto;">`;
        } else if (fileUrl.startsWith('data:application/pdf;base64,')) {
            // Handle PDF preview
            const pdfData = atob(fileUrl.split('data:application/pdf;base64,')[1]);
            const arr = new Uint8Array(pdfData.length);
            for (let i = 0; i < pdfData.length; i++) {
                arr[i] = pdfData.charCodeAt(i);
            }
            const pdfBlob = new Blob([arr], { type: 'application/pdf' });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const newTab = window.open(pdfUrl, '_blank');
            if (!newTab) {
                throw new Error('Failed to open new tab');
            }
        } else {
            this.showToast(Error_Label, 'Unsupported file format for preview', 'error');
        }
    } catch (error) {
        this.showToast(Error_Label, 'Error opening file', 'error');
    }
}


handleRemoveFile(event) {
    const fileType = event.target.name;
    const fileId = event.target.dataset.id;
    let fileToDelete;
    this.isLoading=true;

    if (fileType === 'Class Twelve Marks Card') {
        fileToDelete = this.class12Files.find(file => String(file.title) === String(fileId));
        this.class12Files = this.class12Files.filter(item => String(item.title) !== String(fileId));
        this.class12FilesNew = this.class12FilesNew.filter(item => String(item.title) !== String(fileId));

    } else if (fileType === 'Class Ten Marks Card') {
        fileToDelete = this.class10Files.find(file => String(file.title) === String(fileId));
        this.class10Files = this.class10Files.filter(item => String(item.title) !== String(fileId)); 
        this.class10FilesNew = this.class10FilesNew.filter(item => String(item.title) !== String(fileId));
        

    }else if (fileType === 'Class Eight Marks Card') {
        fileToDelete = this.class8Files.find(file => String(file.title) === String(fileId));
        this.class8Files = this.class8Files.filter(item => String(item.title) !== String(fileId)); 
        this.class8FilesNew = this.class8FilesNew.filter(item => String(item.title) !== String(fileId));

    }
    if (fileToDelete) {
        this.handledeletefile(fileToDelete.title, fileToDelete.fileName,fileToDelete.fileType,this.applicationId);
        
    } else {
    }
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


formatFieldName(fieldName) {
    return fieldName.replace(/([A-Z])/g, ' $1').toLowerCase();
}    

handlePercentageValidation(event) {
    const inputChar = event.key;
    const currentValue = event.target.value.trim();
    if (event.key === 'Backspace' || event.key === 'Tab') {
        return;
    }
    const regex = /^(?:100(?:\.0{1,2})?|(?:[0-9]?\d)(?:\.\d{0,2})?)$/;
    const newValue = currentValue + inputChar;
    if (!regex.test(newValue)) {
        event.preventDefault();
        return;
    }
}

async updateContact() {
        if(this.isEductionalDetailsSubmitted === false){
            this.progressValue = this.updateProgressbarStatus + parseInt(25);

        }else{
            this.progressValue = this.updateProgressbarStatus;
        }

    const field={};
    field[CONTACT_ID.fieldApiName] = this.userContactId;
    field[CLASS_EIGHT_YEAR_OF_PASSING.fieldApiName] = this.class8YearOfPassing;
    field[CLASS_EIGHT_EDUCATION_MODE.fieldApiName] = this.class8ModeOfEducation;
    field[CLASS_EIGHT_BOARD_NAME.fieldApiName] = this.class8BoardName ? this.class8BoardName : '';
    field[CLASS_EIGHT_OTHER_BOARD_NAME.fieldApiName] = this.otherClass8BoardName ? this.otherClass8BoardName : '';

    field[CLASS_EIGHT_SCHOOL_NAME.fieldApiName] = this.class8SchoolName ? this.class8SchoolName : '';
    field[CLASS_EIGHT_OTHER_SCHOOL_NAME.fieldApiName] = this.class8otherSchoolName ? this.class8otherSchoolName : '';
    field[CLASS_EIGHT_EXAM_CENTRE_STATE.fieldApiName] = this.class8ExamState;
    field[CLASS_EIGHT_EXAM_CENTRE_DISTRICT.fieldApiName] = this.class8ExamDistrict;
    field[CLASS_EIGHT_EXAM_BLOCK.fieldApiName] = this.class8ExamBlock;
    field[CLASS_EIGHT_EXAM_CENTRE_PINCODE.fieldApiName] = this.class8Pincode ? this.class8Pincode :'';
    field[CLASS_EIGHT_PASS_PERCENTAGE.fieldApiName] = this.class8Percentage;

    field[CLASS_TEN_YEAR_OF_PASSING.fieldApiName] = this.class10YearOfPassing;
    field[CLASS_TEN_EDUCATION_MODE.fieldApiName] = this.class10ModeOfEducation;
    field[CLASS_TEN_BOARD_NAME.fieldApiName] = this.class10BoardName ? this.class10BoardName : '';
    field[CLASS_TEN_OTHER_BOARD_NAME.fieldApiName] = this.otherClass10BoardName ? this.otherClass10BoardName : '';

    field[CLASS_TEN_SCHOOL_NAME.fieldApiName] = this.class10SchoolName ? this.class10SchoolName : '';
    field[CLASS_TEN_OTHER_SCHOOL_NAME.fieldApiName] = this.class10otherSchoolName ? this.class10otherSchoolName : '';
    field[CLASS_TEN_EXAM_CENTRE_STATE.fieldApiName] = this.class10ExamState;
    field[CLASS_TEN_EXAM_CENTRE_DISTRICT.fieldApiName] = this.class10ExamDistrict;
    field[CLASS_TEN_EXAM_BLOCK.fieldApiName] = this.class10ExamBlock;       
    field[CLASS_TEN_EXAM_CENTRE_PINCODE.fieldApiName] = this.class10Pincode ? this.class10Pincode : '';
    field[CLASS_TEN_PASS_PERCENTAGE.fieldApiName] = this.class10Percentage;

    field[CLASS_TWELVE_YEAR_OF_PASSING.fieldApiName] = this.class12YearOfPassing;
    field[CLASS_TWELVE_EDUCATION_MODE.fieldApiName] = this.class12ModeOfEducation;
    field[CLASS_TWELVE_BOARD_NAME.fieldApiName] = this.class12BoardName ? this.class12BoardName : '';
    field[CLASS_TWELVE_OTHER_BOARD_NAME.fieldApiName] = this.otherClass12BoardName ? this.otherClass12BoardName : '';

    field[CLASS_TWELVE_SCHOOL_NAME.fieldApiName] = this.class12SchoolName ? this.class12SchoolName : '';

    field[CLASS_TWELVE_OTHER_SCHOOL_NAME.fieldApiName] = this.class12otherSchoolName ? this.class12otherSchoolName : '';
    field[CLASS_TWELVE_EXAM_CENTRE_STATE.fieldApiName] = this.class12ExamState;
    field[CLASS_TWELVE_EXAM_CENTRE_DISTRICT.fieldApiName] = this.class12ExamDistrict;
    field[CLASS_TWELVE_EXAM_BLOCK.fieldApiName] = this.class12ExamBlock;
    field[CLASS_TWELVE_EXAM_CENTRE_PINCODE.fieldApiName] = this.class12Pincode ?  this.class12Pincode :'';
    field[CLASS_TWELVE_PASS_PERCENTAGE.fieldApiName] = this.class12Percentage;
    field[EDU_COMPLETED.fieldApiName] = true;
    field[EDU_PROGRESS_STATUS.fieldApiName] = this.progressValue;
    
    const recordInput = { fields: field };

    try {
        await updateRecord(recordInput).then((res) => {
        })
        .catch((error) => {
        });

    } catch (error) {
        this.showToast(Error_Label, error.body.message , 'error');            
    }

}


handlePaste(event) {
    event.preventDefault();
}

handleFormCompletionStatus() {
const isCompleted = true;
const event = new CustomEvent('formcompleted', {
    detail: { formName: 'academicDetails', isCompleted , selcetedItem:'socioEconomicDetails', isProvisional:'' }
});
this.scrollToTop();
this.dispatchEvent(event);
}

showToast(title, message, variant) {
    const event = new ShowToastEvent({
        title: title,
        message: message,
        variant: variant,
    });
    this.dispatchEvent(event);
    this.scrollToTop();
}

validateForm(event) {
    let isValidCombobox = true;
    let isValidYearOfPassing = true;
    let isValidPincode = true;
    let isValidSchoolName = true;

    const comboboxCheck = [...this.template.querySelectorAll('lightning-combobox')];
    const yearOfPassingCheck = [...this.template.querySelectorAll('.year-of-passing')];
    const schoolNameCheck = [...this.template.querySelectorAll('search-input')];
    const skipFields = [
        'class8YearOfPassing',
        'class8ModeOfEducation', 
        'class8ExamState', 
        'class8ExamDistrict', 
        'class8ExamBlock', 
        'class8SchoolName', 
        'class8otherSchoolName', 
        'class8BoardName', 
        'otherClass8BoardName', 
        'class8Percentage', 
        'class8File'
    ];

    comboboxCheck.forEach(box => {
        if (skipFields.includes(box.name)) {
            return; 
        }
        if (!box.value || !box.value.trim()) {
            box.setCustomValidity(Complete_This_Field_Label);
            isValidCombobox = false;
        } else {
            box.setCustomValidity('');
        }
        box.reportValidity();
    });

    yearOfPassingCheck.forEach(box => {
        const currentYear = new Date().getFullYear();
        const yearValue = parseInt(box.value, 10);
        const fieldName = box.name; 
        const class8YearValue = parseInt(this.class8YearOfPassing, 10);

        if (!class8YearValue && fieldName == 'class8YearOfPassing') {
            return; 
        }
        if (fieldName == 'class8File') {
            return; 
        }

        if (fieldName === 'class12YearOfPassing') {

            const class10YearValue = parseInt(this.class10YearOfPassing, 10);
            const parsedYearValue = Number(yearValue);

            if (yearValue == null || yearValue === '' || isNaN(parsedYearValue) ) {
                box.setCustomValidity(Complete_This_Field_Label);
                isValidYearOfPassing = false;
            }        
            
            else if (!/^[0-9]{4}$/.test(yearValue)) {
                box.setCustomValidity(Less_Than_4_Digits_Error_Label);
                isValidYearOfPassing = false;
            } else if (yearValue < 1990) {
                box.setCustomValidity(Less_Than_1990_Label);
                isValidYearOfPassing = false;
            } else if (yearValue > currentYear) {
                box.setCustomValidity(Future_Year_Error_Label);
                isValidYearOfPassing = false;
            } else if (yearValue <= class8YearValue) {
                box.setCustomValidity(X12_same_as_8_Error_Label);
                isValidYearOfPassing = false;
            } else if (yearValue < class8YearValue + 4) {
                box.setCustomValidity(X12_As_2022_Class_8_As_2021_Label);
                isValidYearOfPassing = false;
            } else if (yearValue <= class10YearValue) {
                box.setCustomValidity(X12_Same_As_10_Erro_Label);
                isValidYearOfPassing = false;
            } else if (yearValue === class10YearValue) {
                box.setCustomValidity(X12_Same_As_10_Erro_Label);
                isValidYearOfPassing = false;
            } else if (yearValue === class8YearValue) {
                box.setCustomValidity(X12_same_as_8_Error_Label);
                isValidYearOfPassing = false;
            } else if (yearValue < class10YearValue + 2) {
                box.setCustomValidity(X12_As_2022_Class_10_as_2021_Label);
                isValidYearOfPassing = false;
            } else {
                box.setCustomValidity("");
            }
        } else if (fieldName === 'class10YearOfPassing') {
            const class12YearValue = parseInt(this.class12YearOfPassing, 10);

            const parsedYearValue = Number(yearValue);

            if (yearValue == null || yearValue === '' || isNaN(parsedYearValue) ) {
                box.setCustomValidity(Complete_This_Field_Label);
                isValidYearOfPassing = false;

            }        

            else if (!/^[0-9]{4}$/.test(yearValue)) {

                box.setCustomValidity(Less_Than_4_Digits_Error_Label);
                isValidYearOfPassing = false;
            } else if (yearValue === class8YearValue) {
                box.setCustomValidity(X10_Same_As_8_Error_Label);
                isValidYearOfPassing = false;
            } else if (yearValue === class12YearValue) {
                box.setCustomValidity(X10_Same_As_12_Error_Label);
                isValidYearOfPassing = false;
            } else if (yearValue < class8YearValue + 2) {
                box.setCustomValidity(X10_Gap_8_Label);
                isValidYearOfPassing = false;
            } else if (yearValue > class12YearValue - 2) {
                box.setCustomValidity(X10As12_Label);
                isValidYearOfPassing = false;
            } else if (yearValue > currentYear) {
                box.setCustomValidity(Future_Year_Error_Label);
                isValidYearOfPassing = false;
            } else {
                box.setCustomValidity("");
            }
        } else if (fieldName === 'class8YearOfPassing') {

            const class10YearValue = parseInt(this.class10YearOfPassing, 10);
            const class12YearValue = parseInt(this.class12YearOfPassing, 10);

            if (!/^[0-9]{4}$/.test(yearValue)) {
                box.setCustomValidity(Less_Than_4_Digits_Error_Label);
                isValidYearOfPassing = false;
            } else if (yearValue === class10YearValue) {
                box.setCustomValidity(X8_Same_As_10_Error_Label);
                isValidYearOfPassing = false;
            } else if (yearValue === class12YearValue) {
                box.setCustomValidity(X8_Same_As_12_Error_Label);
                isValidYearOfPassing = false;
            } else if (yearValue >= class10YearValue - 1) {
                box.setCustomValidity(X8_As_2023_Class_10_As_2022_Label);
                isValidYearOfPassing = false;
            } else if (yearValue >= class12YearValue - 3) {
                box.setCustomValidity(X8_As_2023_Class_12_As_2022_Label);
                isValidYearOfPassing = false;
            } else if (yearValue > currentYear) {
                box.setCustomValidity(Future_Year_Error_Label);
                isValidYearOfPassing = false;
            } else {
                box.setCustomValidity("");
            }
        }
        box.reportValidity();
    });

    return isValidCombobox && isValidYearOfPassing;
}


uploadAllFileDetails(fileArrays) {
    const allFiles = fileArrays.flat(); 

    if (allFiles.length > 0) {
        this.isLoading=true;
        const fileName = allFiles.map((e) => e.fileName);
        const fileType = allFiles.map((e) => e.fileType);
        const fileBase64 = allFiles
            .map((e) => {
                if (!e.fileBase64) {
                    return null;
                }
                return e.fileBase64;
            })
            .filter((data) => data !== null); 

        if (fileName.length > 0 && fileBase64.length > 0 && fileType.length > 0) {
            uploadEducationFiles({
                base64Data: fileBase64,
                fileName: fileName,
                documentType: fileType,
                applicationId: this.applicationId,
            })
                .then((result) => {
                    fileArrays.forEach((fileArray) => fileArray.length = 0);
                    if(this.fileFetchProcessCompleted===true){
                        this.isLoading=false;
                    }       

                })
                .catch((error) => {
                });
        } else {
            if(this.fileFetchProcessCompleted===true){
                this.isLoading=false;
            }
        this.showToast(Error_Label, 'No files to upload', 'error');
        }
    } else {
        this.fileUploadProcessCompleted=true;
        if(this.fileFetchProcessCompleted=true){
            this.isLoading=false;
        }
    }
}

validateClass12Fields() {
    const inputs = [...this.template.querySelectorAll('lightning-input, lightning-combobox')];
    let allValid = true;
    const currentYear = new Date().getFullYear();
    const class8YearValue = parseInt(this.class8YearOfPassing, 10);
    const class10YearValue = parseInt(this.class10YearOfPassing, 10);

    inputs.forEach(input => {
        if (input.name === 'class12YearOfPassing') {
            const yearValue = parseInt(input.value, 10);

            if (!yearValue || isNaN(yearValue)) {
                input.setCustomValidity(Complete_This_Field_Label);
                allValid = false;
            } else if (!/^[0-9]{4}$/.test(input.value)) {
                input.setCustomValidity(Less_Than_4_Digits_Error_Label);
                allValid = false;
            } else if (yearValue < 1990) {
                input.setCustomValidity(Less_Than_1990_Label);
                allValid = false;
            } else if (yearValue > currentYear) {
                input.setCustomValidity(Future_Year_Error_Label);
                allValid = false;
            } else if (yearValue <= class8YearValue) {
                input.setCustomValidity(X12_same_as_8_Error_Label);
                allValid = false;
            } else if (yearValue < class8YearValue + 4) {
                input.setCustomValidity(X12_As_2022_Class_8_As_2021_Label);
                allValid = false;
            } else if (yearValue <= class10YearValue) {
                input.setCustomValidity(X12_Same_As_10_Erro_Label);
                allValid = false;
            } else if (yearValue === class10YearValue) {
                input.setCustomValidity(X12_Same_As_10_Erro_Label);
                allValid = false;
            } else if (yearValue === class8YearValue) {
                input.setCustomValidity(X12_same_as_8_Error_Label);
                allValid = false;
            } else if (yearValue < class10YearValue + 2) {
                input.setCustomValidity(X12_As_2022_Class_10_as_2021_Label);
                allValid = false;
            } else {
                input.setCustomValidity("");
            }
        } else if (input.name === 'class12File') {
            if (this.class12Files.length === 0) {
                input.setCustomValidity(Complete_This_Field_Label);
                allValid = false;
            } else {
                input.setCustomValidity('');
            }
        } else if (input.name === 'class12pincode') {
            if (!input.value || input.value.trim() === '') {
                return;
            } else if (input.value.length !== 6 || isNaN(input.value)) {
                input.setCustomValidity(Pin_code_should_be_exactly_6_digits_label);
                allValid = false;
            } else {
                input.setCustomValidity('');
            }
        } else if (input.name === 'class12Percentage') {
            if (!input.value || input.value.trim() === '') {
                input.setCustomValidity(Complete_This_Field_Label);
                allValid = false;
            } else if (input.value < 33 || input.value > 100) {
                input.setCustomValidity(Less_Than_33_Error_Label);
                allValid = false;
            } else {
                input.setCustomValidity('');
            }
        } else if (input.name === 'class12SchoolName') {
            if (!this.class12SchoolName || this.class12SchoolName.trim() === '') {
                input.setCustomValidity(Complete_This_Field_Label);
                allValid = false;
                this.filteredSchools1 = false;
                this.noResults = false;
            } else {
                input.setCustomValidity('');
            }
        } else {
            if (!input.value || !input.value.trim()) {
                input.setCustomValidity(Complete_This_Field_Label);
                allValid = false;
            } else {
                input.setCustomValidity('');
            }
        }
        input.reportValidity(); 
    });
        return allValid;
}
validateClass10Fields() {
    const inputs = [...this.template.querySelectorAll('lightning-input, lightning-combobox')];
    let allValid = true;
    const currentYear = new Date().getFullYear();

    inputs.forEach(input => {
        const yearValue = parseInt(input.value, 10);

        if (input.name === 'class10YearOfPassing') {
            const class12YearValue = parseInt(this.class12YearOfPassing, 10);
            const class8YearValue = parseInt(this.class8YearOfPassing, 10);

            if (isNaN(yearValue)) {
                input.setCustomValidity(Complete_This_Field_Label);
                allValid = false;
            } else if (!/^[0-9]{4}$/.test(yearValue)) {
                input.setCustomValidity(Less_Than_4_Digits_Error_Label);
                allValid = false;
            } else if (yearValue === class8YearValue) {
                input.setCustomValidity(X10_Same_As_8_Error_Label);
                allValid = false;
            } else if (yearValue === class12YearValue) {
                input.setCustomValidity(X10_Same_As_12_Error_Label);
                allValid = false;
            } else if (yearValue < class8YearValue + 2) {
                input.setCustomValidity(X10_Gap_8_Label);
                allValid = false;
            } else if (yearValue > class12YearValue - 2) {
                input.setCustomValidity(X10As12_Label);
                allValid = false;
            } else if (yearValue > currentYear) {
                input.setCustomValidity(Future_Year_Error_Label);
                allValid = false;
            } else {
                input.setCustomValidity("");
            }
        } else if (input.name === 'class10File') {
            if (this.class10Files.length === 0) {
                input.setCustomValidity(Complete_This_Field_Label);
                allValid = false;
            } else {
                input.setCustomValidity('');
            }
        } else if (input.name === 'class10pincode') {
            if (!input.value || input.value.trim() === '') {
                return;
            } else if (input.value.length !== 6 || isNaN(input.value)) {
                input.setCustomValidity(Pin_code_should_be_exactly_6_digits_label);
                allValid = false;
            } else {
                input.setCustomValidity('');
            }
        } else if (input.name === 'class10Percentage') {
            if (!input.value || input.value.trim() === '') {
                input.setCustomValidity(Complete_This_Field_Label);
                allValid = false;
            } else if (input.value < 33 || input.value > 100) {
                input.setCustomValidity(Less_Than_33_Error_Label);
                allValid = false;
            } else {
                input.setCustomValidity('');
            }
        } else if (input.name === 'class10SchoolName') {
            if (!this.class10SchoolName || this.class10SchoolName.trim() === '') {
                input.setCustomValidity(Complete_This_Field_Label);
                allValid = false;
                this.filteredSchools1 = false;
                this.noResults = false;
            } else {
                input.setCustomValidity('');
            }
        } else {
            if (!input.value || !input.value.trim()) {
                input.setCustomValidity(Complete_This_Field_Label);
                allValid = false;
            } else {
                input.setCustomValidity('');
            }
        }
        input.reportValidity();
    });

    return allValid;
}
async updateClass12Contact() {
    const field={};
    field[CONTACT_ID.fieldApiName] = this.userContactId;
    field[CLASS_TWELVE_YEAR_OF_PASSING.fieldApiName] = this.class12YearOfPassing;
    field[CLASS_TWELVE_EDUCATION_MODE.fieldApiName] = this.class12ModeOfEducation;
    field[CLASS_TWELVE_BOARD_NAME.fieldApiName] = this.class12BoardName ? this.class12BoardName : '';
    field[CLASS_TWELVE_OTHER_BOARD_NAME.fieldApiName] = this.otherClass12BoardName ? this.otherClass12BoardName : '';
    field[CLASS_TWELVE_SCHOOL_NAME.fieldApiName] = this.class12SchoolName ? this.class12SchoolName : '';
    field[CLASS_TWELVE_OTHER_SCHOOL_NAME.fieldApiName] = this.class12otherSchoolName ? this.class12otherSchoolName : '';
    field[CLASS_TWELVE_EXAM_CENTRE_STATE.fieldApiName] = this.class12ExamState;
    field[CLASS_TWELVE_EXAM_CENTRE_DISTRICT.fieldApiName] = this.class12ExamDistrict;
    field[CLASS_TWELVE_EXAM_BLOCK.fieldApiName] = this.class12ExamBlock;
    field[CLASS_TWELVE_EXAM_CENTRE_PINCODE.fieldApiName] = this.class12Pincode ?  this.class12Pincode :'';
    field[CLASS_TWELVE_PASS_PERCENTAGE.fieldApiName] = this.class12Percentage;
    const recordInput = { fields: field };
    try {
        await updateRecord(recordInput).then((res) => {
        })
        .catch((error) => {
        });

    } catch (error) {
        this.showToast(Error_Label, error.body.message , 'error');            
    }

}
async updateClass10Contact() {
    if(this.isEductionalDetailsSubmitted === false){
        this.progressValue = this.updateProgressbarStatus + parseInt(25);
    }else{
        this.progressValue = this.updateProgressbarStatus;
    }
    const field={};
    field[CONTACT_ID.fieldApiName] = this.userContactId;
    field[CLASS_TEN_YEAR_OF_PASSING.fieldApiName] = this.class10YearOfPassing;
    field[CLASS_TEN_EDUCATION_MODE.fieldApiName] = this.class10ModeOfEducation;
    field[CLASS_TEN_BOARD_NAME.fieldApiName] = this.class10BoardName ? this.class10BoardName : '';
    field[CLASS_TEN_OTHER_BOARD_NAME.fieldApiName] = this.otherClass10BoardName ? this.otherClass10BoardName : '';
    field[CLASS_TEN_SCHOOL_NAME.fieldApiName] = this.class10SchoolName ? this.class10SchoolName : '';
    field[CLASS_TEN_OTHER_SCHOOL_NAME.fieldApiName] = this.class10otherSchoolName ? this.class10otherSchoolName : '';
    field[CLASS_TEN_EXAM_CENTRE_STATE.fieldApiName] = this.class10ExamState;
    field[CLASS_TEN_EXAM_CENTRE_DISTRICT.fieldApiName] = this.class10ExamDistrict;
    field[CLASS_TEN_EXAM_BLOCK.fieldApiName] = this.class10ExamBlock;       
    field[CLASS_TEN_EXAM_CENTRE_PINCODE.fieldApiName] = this.class10Pincode ? this.class10Pincode : '';
    field[CLASS_TEN_PASS_PERCENTAGE.fieldApiName] = this.class10Percentage;
    field[EDU_COMPLETED.fieldApiName] = true;
    field[EDU_COMPLETED.fieldApiName] = true;
    field[EDU_PROGRESS_STATUS.fieldApiName] = this.progressValue;

    
    const recordInput = { fields: field }

    try {
        await updateRecord(recordInput).then((res) => {
        })
        .catch((error) => {
        });

    } catch (error) {
        this.showToast(Error_Label, error.body.message , 'error');            
    }

}



handleSaveAndContinue(event) { 

    const inputs = [...this.template.querySelectorAll('lightning-input, lightning-combobox')];
    let allValid = true;

    inputs.forEach(input => {
        if ([
            'class8YearOfPassing',
            'class8ModeOfEducation', 
            'class8ExamState', 
            'class8ExamDistrict', 
            'class8ExamBlock', 
            'class8SchoolName',
            'class8otherSchoolName', 
            'class8BoardName', 
            'otherClass8BoardName',  
            'class8File'
        ].includes(input.name)) {
            return;
        }
        if (input.name === 'class12File') {
            if (this.class12Files.length === 0) {
                input.setCustomValidity(Complete_This_Field_Label);
                allValid = false;
            } else {
                return; 
            }
        } else if (input.name === 'class10File') {
            if (this.class10Files.length === 0) {
                input.setCustomValidity(Complete_This_Field_Label);
                allValid = false;
            } else {
                return;
            }
        }else if (input.name === 'class12pincode' || input.name === 'class10pincode' || input.name === 'class8pincode') {
            if (!input.value || input.value.trim() === '') {
                return;
            } else if (input.value.length !== 6 || isNaN(input.value)) {
                input.setCustomValidity(Pin_code_should_be_exactly_6_digits_label);
                allValid = false;
            } else {
                input.setCustomValidity('');
            }
        }else if (input.name === 'class12Percentage' || input.name === 'class10Percentage') {
            if (!input.value || input.value.trim() === '') {
                input.setCustomValidity(Complete_This_Field_Label);
                allValid = false;
            } else if (input.value < 33 || input.value > 100) {
                input.setCustomValidity(Less_Than_33_Error_Label);
                allValid = false;
            } else {
                input.setCustomValidity('');
            }
        }else if (input.name === 'class8Percentage') {
            if (!input.value || input.value.trim() === '') {
                return;
            }

            else if (input.value < 33 || input.value > 100) {
                input.setCustomValidity(Less_Than_33_Error_Label);
                allValid = false;
            } else {
                input.setCustomValidity('');
            }
        }else if (input.name === 'class12SchoolName') {
            if (!this.class12SchoolName || this.class12SchoolName.trim() === '' || this.class12SchoolName == null) {
                input.setCustomValidity(Complete_This_Field_Label);
                allValid = false;
                this.filteredSchools1 = false;
                this.noResults = false;
            } else {
                input.setCustomValidity('');
            }
        }else if (input.name === 'class10SchoolName') {
            if (!this.class10SchoolName || this.class10SchoolName.trim() === '' || this.class10SchoolName == null) {
                input.setCustomValidity(Complete_This_Field_Label);
                allValid = false;
                this.filteredSchools1 = false;
                this.noResults = false;
            } else {
                input.setCustomValidity('');
            }
        }
        else {
            if (!input.value || !input.value.trim()) {
                input.setCustomValidity(Complete_This_Field_Label);
                allValid = false;
            } else {
                input.setCustomValidity('');
            }
        }
        input.reportValidity(); 
    }); 

    const isValidForm = this.validateForm();

    allValid = allValid && isValidForm;

    if (allValid) {

        this.updateContact(this.progressValue);
        this.uploadAllFileDetails([this.class8FilesNew]);
        this.showToast(Success_Label, Education_Success_Label, 'success');
        this.handleFormCompletionStatus();

        refreshApex(this.contactRecord);
    }

    return allValid; 
}

scrollToTop() {
    
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    const scrollableContainer = this.template.querySelector('.scrollable-container');
    if (scrollableContainer) {
        
        scrollableContainer.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

}