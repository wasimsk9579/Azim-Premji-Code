import { LightningElement, api, wire, track } from 'lwc';
import { getRecord,updateRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from "lightning/navigation";
import { CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import USER_ID from '@salesforce/user/Id';
import CONTACT_ID_FIELD from '@salesforce/schema/User.ContactId';
import uploadFilesToServer from '@salesforce/apex/APFS_BankAndAgreementFileController.FilesuploadtoServer';
import deleteFileByContentDocumentId from '@salesforce/apex/APFS_BankAndAgreementFileController.deleteFileByContentDocumentId';
import fetchDocumentsByType from '@salesforce/apex/APFS_BankAndAgreementFileController.fetchDocumentsByType';

import USER_LANGUAGE_FIELD from '@salesforce/schema/User.LanguageLocaleKey'; 
import INVALID_FILE_TYPE_ERROR_CUSTOM_LABEL from '@salesforce/label/c.Invalid_file_type_error_custom_label';
import NO_INTERNET_CONNECTION_LABEL from '@salesforce/label/c.No_Internet_Connection_label';
import FILE_SIZE_ERROR from '@salesforce/label/c.File_Size_Error_CustomLabel';
import MAX_3_FILE_ERROR_CUSTOM_LABEL from '@salesforce/label/c.Max_3_file_error_custom_label';
import FILE_UPLOADED_SUCCESSFULLY_LABEL from '@salesforce/label/c.File_Uploaded_Successfully';
import FILE_DELETED_SUCCESSFULLY_LABEL from '@salesforce/label/c.File_Deleted_Successfully';
import DUPLICATE_FILE_FOUND_LABEL from '@salesforce/label/c.Duplicate_file_found';
import SUCCESS_TOAST_LABEL from '@salesforce/label/c.Success_Label';
import ERROR_LABEL from '@salesforce/label/c.Error_Label';

import File_Help_Test_Label from '@salesforce/label/c.File_Help_Test_Label';
import agreement_file_upload_helptext from '@salesforce/label/c.agreement_file_upload_helptext';
import Complete_this_field_Label from '@salesforce/label/c.Complete_this_field_Label';
import agreement_file_upload_error from '@salesforce/label/c.agreement_file_upload_error';
import Uploaded_File_Label from '@salesforce/label/c.Uploaded_File_Label';
import agreement_offer_letter_heading from '@salesforce/label/c.agreement_offer_letter_heading';
import offer_letter_custom_label from '@salesforce/label/c.offer_letter_custom_label';
import scholarship_agreement_custom_label from '@salesforce/label/c.scholarship_agreement_custom_label';
import upload_signed_agreement_label from '@salesforce/label/c.upload_signed_agreement_label';
import scholarship_agreement_file_success_message from '@salesforce/label/c.scholarship_agreement_file_success_message';

export default class ApfsCoApplicantOfferAgreementLetter extends NavigationMixin(LightningElement)  {
contId;

recordId;
error;
File_Help_Test_Label=File_Help_Test_Label;
applicationId;

isDisableAllFields=false;
@track isLoading = false;



isDisableAllFields=false;
requiredfielderror=Complete_this_field_Label;
selectedLanguage = '';
appstatus;
applicationdata;
isAccpetOfferTask=false;

showbankdetails=false;
isNewFileSelected = false;
agreementFileUploadHelptext=agreement_file_upload_helptext;
uploadfile=Uploaded_File_Label;
agreementOfferletterHeading=agreement_offer_letter_heading;
offerLetterLabel=offer_letter_custom_label;
scholarshipAgreementLabel=scholarship_agreement_custom_label;
uploadSignedLabel=upload_signed_agreement_label;

maxFiles = 3; // Maximum number of files allowed
maxFileSize = 1.5 * 1024 * 1024; // 1.5MB file size limit
acceptedFormats = ['pdf', 'jpeg', 'jpg', 'png']; // Allowed file types
validMimeTypes = ['application/pdf', 'image/jpeg', 'image/png']; // Allowed MIME types
@track uploadedFiles = []; // List of uploaded files


@wire(CurrentPageReference)
currentPageReference;
connectedCallback() {
    this.isLoading=true;
// Extract applicationId from the URL
this.applicationId = this.currentPageReference?.state?.Id || null;
this.appstatus = this.currentPageReference?.state?.status || null; 
if(this.appstatus=='Offer Letter Issued')
{
    this.isAccpetOfferTask=true;
}
this.loadExistingAgreementFiles();

}



//Get contact Id
@wire(getRecord, { recordId: USER_ID, fields: CONTACT_ID_FIELD })
wiredUser({ error, data }) {
if (data) {
    this.contId = getFieldValue(data, CONTACT_ID_FIELD);
    
} else if (error) {
    this.error=error;
}
}

 @wire(getRecord, { recordId: USER_ID, fields: [USER_LANGUAGE_FIELD] })
    wiredlanguageUser({ error, data }) {
        if (data) {
            
            this.selectedLanguage = data.fields.LanguageLocaleKey.value || 'en_US';
          
        } else if (error) {
            this.showToast('Error',error.body.message?error.body.message:'Something went wrong.', 'error');
        }
    }
    
    handleagreementclick()
    {
    
        if (this.selectedLanguage === 'en_US') {
          
    
            if (this.applicationId) {
                const vfPageUrl = `/apex/Scholarship_Agreement?Id=${this.applicationId}`;
                 window.open(vfPageUrl, '_blank');
             } else {
                 this.showToast('Error', 'Application ID is missing. Cannot preview the form.', 'error');
             }
    
    
        } else if (this.selectedLanguage === 'hi') {
            const vfPageUrl = `/apex/Scholarship_Agreement_Hindi?Id=${this.applicationId}`;
            window.open(vfPageUrl, '_blank');
        } else {
            this.showToast('Error', 'Application ID is missing. Cannot preview the form.', 'error');
        }
    }
    
    
    async loadExistingAgreementFiles() {
            try {
                const DocumentWrapper = await fetchDocumentsByType({documentType: 'Signed Scholarship Agreement' });
                if (DocumentWrapper && DocumentWrapper.length > 0) {
                    this.uploadedFiles = DocumentWrapper.map(file => ({
                        contentDocumentId: file.contentDocumentId,
                        name: file.fileName,
                    }));
                    this.isLoading=false;
                  
                } else {
                   this.isLoading=false;
                }
            
            } catch (error) {
                this.isLoading=false;
            }
        }




    handleAgreementFileUpload(event) {
        
        const files = Array.from(event.target.files);
        const fileInput = event.target;
        const newFilesCount = files.length;
        const existingFilesCount = this.uploadedFiles.length;

        // Reset custom validity
        fileInput.setCustomValidity('');

        // Validate if the total number of files (existing + new) exceeds the maximum limit
        if (newFilesCount + existingFilesCount > this.maxFiles) {
            const errorMessage = MAX_3_FILE_ERROR_CUSTOM_LABEL;
            this.showToast(ERROR_LABEL, errorMessage, 'error');
            return;
        }

        // Check internet connectivity before proceeding
        if (!navigator.onLine) {
            const errorMessage = NO_INTERNET_CONNECTION_LABEL;
            this.showToast(ERROR_LABEL, errorMessage, 'error');
            return;
        }

        // Perform file validations before proceeding
        const validFiles = this.validateFiles(files, fileInput);

        // Proceed with file upload if validations pass
        if (validFiles.length > 0) {
            this.uploadFiles(validFiles);
        }
    }

    validateFiles(files, fileInput) {
        const validFiles = [];
        const existingFileNames = new Set(this.uploadedFiles.map(file => file.name.toLowerCase()));

        for (let file of files) {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const fileMimeType = file.type.toLowerCase();
            const fileSize = file.size;
            const fileName = file.name.toLowerCase();

            // 1. Validate file format
            if (!this.acceptedFormats.includes(fileExtension)) {
                const errorMessage = INVALID_FILE_TYPE_ERROR_CUSTOM_LABEL;
                this.showToast(ERROR_LABEL, errorMessage, 'error');
                fileInput.setCustomValidity(errorMessage);
                fileInput.reportValidity();
                return []; // Stop further processing
            }

            // 2. Validate MIME Type (based on file content)
            if (!this.validMimeTypes.includes(fileMimeType)) {
                const errorMessage = INVALID_FILE_TYPE_ERROR_CUSTOM_LABEL;
                this.showToast(ERROR_LABEL, errorMessage, 'error');
                fileInput.setCustomValidity(errorMessage);
                fileInput.reportValidity();
                return []; // Stop further processing
            }

            // 3. Validate file size
            if (fileSize > this.maxFileSize) {
                const errorMessage = FILE_SIZE_ERROR;
                this.showToast(ERROR_LABEL, errorMessage, 'error');
                fileInput.setCustomValidity(errorMessage);
                fileInput.reportValidity();
                return []; // Stop further processing
            }

            // 4. Validate for duplicate uploads
            if (existingFileNames.has(fileName)) {
                const errorMessage = DUPLICATE_FILE_FOUND_LABEL +' : '+file.name;
                this.showToast(ERROR_LABEL, errorMessage, 'error');
                return []; // Stop further processing
            }

            // If file passes all validations, add to the validFiles array
            validFiles.push(file);
        }

        // Clear any previous validation errors if files are valid
        fileInput.setCustomValidity('');
        fileInput.reportValidity();

        return validFiles;
    }


    async uploadFiles(files) {
        this.isLoading = true;
        let successfulUploads = [];

        try {
            // Loop through each file and upload one by one
            for (let file of files) {
                // Convert the file to Base64
                const base64File = await this.readFileAsBase64(file);
                
                // Upload the file to the server and receive a single ContentDocumentId

                const contentDocumentIds = await uploadFilesToServer({
                    base64DataList: [base64File],
                    fileNameList: [file.name],
                    documentTypeList: ['Signed Scholarship Agreement'],
                    applicationId: this.applicationId
                });

               
                // If there's a valid ContentDocumentId, add it to the uploaded files array
                if (contentDocumentIds && contentDocumentIds.length > 0) {
                    const contentDocumentId = contentDocumentIds[0];
                    // Add the file information along with the ContentDocumentId to uploadedFiles
                    this.uploadedFiles = [
                        ...this.uploadedFiles, 
                        {
                            name: file.name,
                            contentDocumentId: contentDocumentId 
                        }
                    ];
                    successfulUploads.push(file.name);
                    this.showToast(SUCCESS_TOAST_LABEL, FILE_UPLOADED_SUCCESSFULLY_LABEL, 'success');
                    this.isLoading = false;
                } else {
                    
                    this.showToast(ERROR_LABEL, `Failed to upload ${file.name}.`, 'error');
                    this.isLoading = false;
                }
            }
        } catch (error) {
            this.showToast(ERROR_LABEL, 'Failed to upload a file. Please try again.', 'error');
            this.isLoading = false;
        } finally {
            this.isLoading = false;
            this.clearFileInput();
        }
    }

  readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // Extract Base64 string
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}


  handleFilePreview(event) {
    const contentDocumentId = event.currentTarget.dataset.id;
    const fileUrl = `/sfc/servlet.shepherd/document/download/${contentDocumentId}`;
    
    // Fetch the file as a blob
    fetch(fileUrl)
        .then(response => response.blob())
        .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');
        })
        .catch(error => {
            this.showToast(ERROR_LABEL, 'Failed to preview the file. Please try again.', 'error');
        });
}


    handleFileRemove(event) {
        this.isLoading=true;  //when aadhar is deleteing show spinner
        const contentDocumentId = event.currentTarget.dataset.id;
        
        // Call the Apex method to delete the file from Salesforce
        deleteFileByContentDocumentId({ contentDocumentId:contentDocumentId })
            .then(() => {
                this.isLoading=false;
                this.showToast(SUCCESS_TOAST_LABEL, FILE_DELETED_SUCCESSFULLY_LABEL, 'success');
                const updatedFiles = this.uploadedFiles.filter(file => file.contentDocumentId !== contentDocumentId);
                this.uploadedFiles = [...updatedFiles];        
            })
            .catch(error => {
                this.isLoading=false;
                this.showToast(ERROR_LABEL, 'Failed to delete the file. Please try again.', 'error');
            });
    }


clearFileInput() {
    const agreementFileInput = this.template.querySelector('.scholarship-agreement-file-upload-input');
    agreementFileInput.value = ''; // Reset the file input
}


handleDragOver(event){
        event.dataTransfer.dropEffect = 'none';
    }



handleSave() {
        // Show the spinner when the save operation starts
        this.isLoading = true;
    
        // Check for internet connection
        if (!navigator.onLine) {
            const errorMessage = NO_INTERNET_CONNECTION_LABEL;
            this.showToast(ERROR_LABEL, errorMessage, 'error');
            this.isLoading = false; // Hide the spinner
            return;
        }
    
        // Validate the form before proceeding
        if (this.validateForm()) {
            // Proceed to load existing agreement files
            this.loadExistingAgreementFilesonsave()
                .then((filesLoaded) => {
                    if (filesLoaded) {
                        // If files loaded successfully
                        this.showbankdetails = true;
                        this.isAccpetOfferTask = false;
                        this.showToast(SUCCESS_TOAST_LABEL, scholarship_agreement_file_success_message, 'success'); // Show success message
                        this.isLoading = false;
                    } else {
                        // Show error toast if no files found
                        this.showToast(ERROR_LABEL, agreement_file_upload_error, 'error');
                        this.isLoading = false;
                    }
                })
                .catch((error) => {
                    // Handle any errors during file loading
                    this.showToast(ERROR_LABEL, error.message || 'Error loading files.', 'error');
                    this.isLoading = false;
                })
                .finally(() => {
                    this.isLoading = false; // Hide the spinner once operation completes
                });
        } else {
            // If the form validation fails
            this.showToast(ERROR_LABEL, agreement_file_upload_error, 'error');
            this.isLoading = false; // Hide the spinner if validation fails
        }
    }
    
    validateForm() {
        const inputs = [...this.template.querySelectorAll('lightning-input')];
        let allValid = true;
    
        inputs.forEach(input => {
            if (input.name === 'scholarship-agreement-file-upload-input') {
                // Check if uploadedFiles is empty
                if (this.uploadedFiles.length === 0) {
                    input.setCustomValidity(Complete_this_field_Label);
                    allValid = false;
                } else {
                    input.setCustomValidity(''); // Clear any previous error message
                }
            }
            // Report validity status for all inputs
            input.reportValidity();
        });
    
        return allValid; // Return true if all inputs are valid
    }
    
    async loadExistingAgreementFilesonsave() {
        try {
            const DocumentWrapper = await fetchDocumentsByType({ documentType: 'Signed Scholarship Agreement' });
    
            // Check if the fetched documents exist and are not empty
            if (DocumentWrapper && DocumentWrapper.length > 0) {
                this.uploadedFiles = DocumentWrapper.map(file => ({
                    contentDocumentId: file.contentDocumentId,
                    name: file.fileName,
                }));
                return true; 
            } else {
                return false; 
            }
        } catch (error) {
            return false; 
        }
    }
    
    

 
showToast(Title, Message,Variant) {
    const evt = new ShowToastEvent({
        title: Title,
        message: Message,
        variant: Variant
    });
    this.dispatchEvent(evt);
}
}