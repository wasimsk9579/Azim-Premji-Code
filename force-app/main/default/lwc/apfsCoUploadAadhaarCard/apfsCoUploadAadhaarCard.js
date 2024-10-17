/**
 * @description       : 
 * @author            : owais.ahanger@cloudodyssey.co
 * @group             : 
 * @last modified on  : 09-16-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
**/
import { LightningElement,track,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import COMPLETE_THIS_FIELD_LABEL from '@salesforce/label/c.Complete_this_field_Label';
import UPLOAD_AADHAAR_CARD_LABEL from '@salesforce/label/c.Upload_Aadhaar_Card_Label';
import HELP_TEXT_FOR_UPLOAD_LABEL from '@salesforce/label/c.Help_Text_For_Upload';
import UPLOADED_FILE_LABEL from '@salesforce/label/c.Uploaded_File_Label';
import INVALID_FILE_TYPE_ERROR_CUSTOM_LABEL from '@salesforce/label/c.Invalid_file_type_error_custom_label';
import NO_INTERNET_CONNECTION_LABEL from '@salesforce/label/c.No_Internet_Connection_label';
import FILE_SIZE_ERROR from '@salesforce/label/c.File_Size_Error_CustomLabel';
import MAX_3_FILE_ERROR_CUSTOM_LABEL from '@salesforce/label/c.Max_3_file_error_custom_label';
import FILE_UPLOADED_SUCCESSFULLY_LABEL from '@salesforce/label/c.File_Uploaded_Successfully';
import FILE_DELETED_SUCCESSFULLY_LABEL from '@salesforce/label/c.File_Deleted_Successfully';
import DUPLICATE_FILE_FOUND_LABEL from '@salesforce/label/c.Duplicate_file_found';
import SUCCESS_TOAST_LABEL from '@salesforce/label/c.Success_Label';
import ERROR_LABEL from '@salesforce/label/c.Error_Label';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, getFieldValue} from 'lightning/uiRecordApi';
import uploadFilesToServer from '@salesforce/apex/APFS_MyProfileDocumentsController.uploadFilesToServer';
import deleteFileByContentDocumentId from '@salesforce/apex/APFS_MyProfileDocumentsController.deleteFileByContentDocumentId';
import fetchDocumentsByType from '@salesforce/apex/APFS_MyProfileDocumentsController.fetchDocumentsByType';
import USER_ID from '@salesforce/user/Id';
import CONTACT_ID_FIELD from '@salesforce/schema/User.ContactId';

const USER_FIELDS = [ CONTACT_ID_FIELD];
const CONTACT_FIELDS =['Contact.Is_Aadhaar_Available__c','Contact.Is_Profile_Editable__c','Contact.Is_Profile_Complete__c'];

export default class ApfsCoUploadAadhaarCard extends NavigationMixin(LightningElement) {

    pleaseUploadAadahrCard=COMPLETE_THIS_FIELD_LABEL;
    uploadAadhaarCardLabel = UPLOAD_AADHAAR_CARD_LABEL;
    helpTextForAadhaarUploadLabel=HELP_TEXT_FOR_UPLOAD_LABEL;
    uploadedfilelabel=UPLOADED_FILE_LABEL;

    userContactId;
    isAadhaarAvailable;
    isProfileEditable;
    isProileComplete;

    maxFiles = 3; // Maximum number of files allowed for Aadhaar Card uploads
    maxFileSize = 1.5 * 1024 * 1024; // 1.5MB file size limit
    acceptedFormats = ['pdf', 'jpeg', 'jpg', 'png']; // Allowed file types
    validMimeTypes = ['application/pdf', 'image/jpeg', 'image/png']; // Allowed MIME types

    isAadhaarCardUploading=false;
    isAadhaarCardUploaded=false;

    @track uploadedFiles = []; // List of uploaded files


    /**
     * @description Wire service to get the logged-in user record and retrieve the associated contact ID.
     * @param {Object} wiredData - The data and error properties from getRecord wire service.
     */
    @wire(getRecord, { recordId: USER_ID, fields:USER_FIELDS})
    wiredUser({ error, data }) {
        if (data) {
            this.userContactId = getFieldValue(data, CONTACT_ID_FIELD); 
             
        } else if (error) {
            this.showToast(ERROR_LABEL, 'Failed to load user details.', 'error');
        }
    }

      /**
     * @description Wire service to get the contact record using the contact ID from the user record.
     *              This will run only when the `userContactId` is available.
     * @param {Object} wiredData - The data and error properties from getRecord wire service.
     */
    @wire(getRecord, { recordId: '$userContactId', fields: CONTACT_FIELDS })
    wiredCombinedData({ error, data }) {
        if (data) {
            const aadhaarStatus = getFieldValue(data,'Contact.Is_Aadhaar_Available__c'); 
            this.isAadhaarAvailable = aadhaarStatus === 'Yes'; 
            this.isProfileEditable = getFieldValue(data,'Contact.Is_Profile_Editable__c'); 
            this.isProileComplete = getFieldValue(data,'Contact.Is_Profile_Complete__c'); 
           

        } else if (error) {
            this.showToast(ERROR_LABEL, 'Failed to load contact details.', 'error');
        }
    }

      /**
     * @description Loads existing Aadhaar card files and updates the uploadedFiles array.
     */
      async loadExistingAadharCardFiles() {
        try {
            const DocumentWrapper = await fetchDocumentsByType({documentType: 'Aadhaar Card' });
            if (DocumentWrapper && DocumentWrapper.length > 0) {
                this.uploadedFiles = DocumentWrapper.map(file => ({
                    contentDocumentId: file.contentDocumentId,
                    name: file.fileName,
                }));
                this.isAadhaarCardUploaded = true;
            } else {
                this.isAadhaarCardUploaded = false;
            }
            this.dispatchAadhaarUploadStatus();
        } catch (error) {
            this.showToast(ERROR_LABEL, 'Failed to load Aadhaar card files.', 'error');
        }
    }



     /**
     * @description Dispatches a custom event to the parent with the current aadhaar card upload status.
     */
     dispatchAadhaarUploadStatus() {
        const event = new CustomEvent('aadhaaruploadstatus', {
            detail: { isUploaded: this.isAadhaarCardUploaded }
        });
        this.dispatchEvent(event);
    }
    

    /**
     * @description Handles the Aadhaar Card file upload process after validating files.
     * @param {Event} event - The file input change event.
     */
    handleAadhaarCardUpload(event) {
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

    /**
     * @description Validates the selected files before uploading.
     *              Checks for valid format, size, and duplicates.
     * @param {File[]} files - List of selected files to be validated.
     * @param {HTMLInputElement} fileInput - The file input element to set custom validity.
     * @return {File[]} - A list of valid files that pass all validations.
     */
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
                fileInput.setCustomValidity(errorMessage);
                fileInput.reportValidity();
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



    /**
     * @description Uploads the valid files to the server and updates the UI with file details.
     * @param {File[]} files - List of files that passed validation.
     */
    async uploadFiles(files) {
        this.isAadhaarCardUploading = true;
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
                    documentTypeList: ['Aadhaar Card']
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
                    this.isAadhaarCardUploaded = true;
                    this.showToast(SUCCESS_TOAST_LABEL, FILE_UPLOADED_SUCCESSFULLY_LABEL, 'success');
                } else {
                    
                    this.showToast(ERROR_LABEL, `Failed to upload ${file.name}.`, 'error');
                }
            }
            if (successfulUploads.length === 0) {
                this.isAadhaarCardUploaded = false;
            }
            this.dispatchAadhaarUploadStatus();

        } catch (error) {
            this.showToast(ERROR_LABEL, 'Failed to upload Aadhaar Card. Please try again.', 'error');
            this.isAadhaarCardUploaded = successfulUploads.length > 0;
            this.dispatchAadhaarUploadStatus();
        } finally {
            this.isAadhaarCardUploading = false;
            this.clearFileInput();
        }
    }

  /**
     * @description Converts the file to Base64 using FileReader wrapped in a Promise.
     * @param {File} file - The selected file to be converted.
     * @return {Promise<String>} - A Promise that resolves with the Base64-encoded string of the file.
     */
  readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // Extract Base64 string
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}


  /**
     * @description Handles the file preview event by opening the file in a new tab.
     * @param {Event} event - The click event triggered by clicking the preview icon.
     */
  handleAadhaarCardFilePreview(event) {
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






    /**
     * @description Deletes a file based on its ContentDocumentId and updates the UI.
     * @param {Event} event - The click event triggered by the delete button.
     */
    handleAadhaarCardFileDelete(event) {
        this.isAadhaarCardUploading=true;  //when aadhar is deleteing show spinner
        const contentDocumentId = event.currentTarget.dataset.id;
        
        // Call the Apex method to delete the file from Salesforce
        deleteFileByContentDocumentId({ contentDocumentId:contentDocumentId })
            .then(() => {
                this.isAadhaarCardUploading=false;
                this.showToast(SUCCESS_TOAST_LABEL, FILE_DELETED_SUCCESSFULLY_LABEL, 'success');
                const updatedFiles = this.uploadedFiles.filter(file => file.contentDocumentId !== contentDocumentId);
                this.uploadedFiles = [...updatedFiles];

                 // Check if the length of uploadedFiles is now zero
                 if (this.uploadedFiles.length === 0) {
                    this.isAadhaarCardUploaded = false; 
                }
                this.dispatchAadhaarUploadStatus();
            })
            .catch(error => {
                this.isAadhaarCardUploading=false;
                this.showToast(ERROR_LABEL, 'Failed to delete the file. Please try again.', 'error');
            });
    }


    /**
   * @description Displays a toast message.
   * @param {String} Title - The title of the toast message.
   * @param {String} Message - The detailed  message to be displayed.
   * @param {String} Variant - The variant type to be displayed.
   * @fires ShowToastEvent - Dispatches a toast event to show the message.
   */
  showToast(Title, Message,Variant) {
    const evt = new ShowToastEvent({
        title: Title,
        message: Message,
        variant: Variant
    });
    this.dispatchEvent(evt);
}

/**
 * @description Clears the file input by resetting its value.
 *              This is called after validation failures or after an upload completes.
 */
clearFileInput() {
    const aadhaarCardFileInput = this.template.querySelector('.aadhaar-card-input-file');
    aadhaarCardFileInput.value = ''; // Reset the file input
}

/**
 * @description Adds the 'beforeunload' event listener when the component is connected to the DOM.
 *              This prevents the user from leaving the page during the file upload process.
 */
connectedCallback() {
   // Bind the function to the current context
   this.boundHandleBeforeUnload = this.handleBeforeUnload.bind(this);
    window.addEventListener('beforeunload', this.boundHandleBeforeUnload);

    // Load the existing adhaar card files on component load
    this.loadExistingAadharCardFiles();
}

/**
 * @description Removes the 'beforeunload' event listener when the component is disconnected from the DOM.
 */
disconnectedCallback() {
    window.removeEventListener('beforeunload', this.boundHandleBeforeUnload);
}

/**
 * @description Handles the 'beforeunload' event to prevent the user from navigating away during the file upload process.
 * @param {Event} event - The beforeunload event triggered when the user attempts to leave the page.
 * @fires Event.preventDefault - Prevents the default unload behavior and shows a warning message.
 */
handleBeforeUnload(event) {
    if (this.isAadhaarCardUploading) {
        event.preventDefault();
        
    }
}
    handleDragOver(event){
        event.dataTransfer.dropEffect = 'none';
    }
}