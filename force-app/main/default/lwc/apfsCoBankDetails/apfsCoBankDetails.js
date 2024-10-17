import { LightningElement, track,wire } from 'lwc';
    import { ShowToastEvent } from 'lightning/platformShowToastEvent';
    import { createRecord,getRecord,updateRecord, getFieldValue } from 'lightning/uiRecordApi';
    import { CurrentPageReference } from 'lightning/navigation';
    import { NavigationMixin } from "lightning/navigation";
    import basePath from '@salesforce/community/basePath';
    import getBankDetailsByContactId from '@salesforce/apex/APFS_BankDetailsController.getBankDetailsByContactId';
    import fetchDocumentsByType from '@salesforce/apex/APFS_BankAndAgreementFileController.fetchDocumentsByType';
    import deleteFileByContentDocumentId from '@salesforce/apex/APFS_BankAndAgreementFileController.deleteFileByContentDocumentId';
    import uploadFilesToServer from '@salesforce/apex/APFS_BankAndAgreementFileController.FilesuploadtoServer';
   //Custom Labels Import
    import EXTERNAL_APPLICATION_STATUS from '@salesforce/schema/Application__c.Application_External_Status__c';
    import Application_Internal_Status__c from '@salesforce/schema/Application__c.Application_Internal_Status__c';
    import BANK_ID_FIELD from '@salesforce/schema/Bank_Detail__c.Id';
    import NAME from '@salesforce/schema/Bank_Detail__c.Name';
    import BRANCH_NAME from '@salesforce/schema/Bank_Detail__c.Branch_Name__c';
    import ACCOUNT_NUMBER from '@salesforce/schema/Bank_Detail__c.Encrypted_Bank_Account_Number__c';
    import IFSC_CODE from '@salesforce/schema/Bank_Detail__c.Bank_Ifsc_Code__c';
    import TERM_CONDITION from '@salesforce/schema/Bank_Detail__c.Bank_Details_Consent__c';
    import USER_ID from '@salesforce/user/Id';
    import CONTACT_ID_FIELD from '@salesforce/schema/User.ContactId';
    import INVALID_FILE_TYPE_ERROR_CUSTOM_LABEL from '@salesforce/label/c.Invalid_file_type_error_custom_label';
    import NO_INTERNET_CONNECTION_LABEL from '@salesforce/label/c.No_Internet_Connection_label';
    import BANK_DETAILS_HEADING from '@salesforce/label/c.Bank_details_Heading';
    import BANK_ACCOUNT_NUMBER_LABEL from '@salesforce/label/c.Bank_Account_Number_Label';
    import BANK_IFSC_CODE_LABEL from '@salesforce/label/c.Bank_IFSC_Code_Label';
    import BANK_NAME_LABEL from '@salesforce/label/c.Bank_Name_Label';
    import BRANCH_NAME_LABEL from '@salesforce/label/c.Branch_Name_Label';
    import UPLOAD_BANK_DOCUMENT_LABEL from '@salesforce/label/c.Upload_Bank_Document_Label';
    import Bank_File_Upload_HelpText from '@salesforce/label/c.Bank_File_Upload_HelpText';
    import Uploaded_File_Label from '@salesforce/label/c.Uploaded_File_Label';
    import Complete_this_field_Label from '@salesforce/label/c.Complete_this_field_Label';
    import Error_Label from '@salesforce/label/c.Error_Label';
    import Success_Label from '@salesforce/label/c.Success_Label';
    import bank_statement_file_label from '@salesforce/label/c.bank_statement_file_label';
    import bank_statement_file_helptext from '@salesforce/label/c.bank_statement_file_helptext';
    import bank_file_note_label from '@salesforce/label/c.bank_file_note_label';
    import bank_details_consent from '@salesforce/label/c.bank_details_consent';
    import bank_account_number_placeholder_label from '@salesforce/label/c.bank_account_number_placeholder_label';
    import bank_IFSC_code_placeholder_label from '@salesforce/label/c.bank_IFSC_code_placeholder_label';
    import bank_name_placeholder_label from '@salesforce/label/c.bank_name_placeholder_label';
    import bank_branch_name_placeholder_label from '@salesforce/label/c.bank_branch_name_placeholder_label';
    import Form_error_custom_label from '@salesforce/label/c.Form_error_custom_label';
    import bank_submit_toast_message_label from '@salesforce/label/c.bank_submit_toast_message_label';
    import bank_file_upload_error_message from '@salesforce/label/c.bank_file_upload_error_message';
    import FILE_SIZE_ERROR from '@salesforce/label/c.File_Size_Error_CustomLabel';
    import MAX_3_FILE_ERROR_CUSTOM_LABEL from '@salesforce/label/c.Max_3_file_error_custom_label';
    import FILE_UPLOADED_SUCCESSFULLY_LABEL from '@salesforce/label/c.File_Uploaded_Successfully';
    import FILE_DELETED_SUCCESSFULLY_LABEL from '@salesforce/label/c.File_Deleted_Successfully';
    import DUPLICATE_FILE_FOUND_LABEL from '@salesforce/label/c.Duplicate_file_found';
    


    const BANK_FIELDS =[BANK_ID_FIELD,NAME,BRANCH_NAME,ACCOUNT_NUMBER,IFSC_CODE,TERM_CONDITION];

    export default class ApfsCoBankDetails extends NavigationMixin(LightningElement)  {
        @track conRecordId='';
        @track bankAccountNumber = '';
        @track bankIfscCode = '';
        @track bankName = '';
        @track bankAddress = '';
        @track termsAccepted = false;

        @track isFileDataValid = true;
  
        consentcheckerror=false;
        wiredBankDetailsResult;
        
        bankdetailId;
        bankdetail;
      
        applicationId;
        appPendingTaskiId;
        uploadedbankstatementFiles = [];
        uploadedbankpasbookFiles = [];
        
        showagreement=true;
        

        // Store imported labels in variables
    requiredfielderror=Complete_this_field_Label;
    uploadfile=Uploaded_File_Label;
    completethisfield=Complete_this_field_Label;
    bankDetailsHeading = BANK_DETAILS_HEADING;
    bankAccountNumberLabel = BANK_ACCOUNT_NUMBER_LABEL;
    bankIfscCodeLabel = BANK_IFSC_CODE_LABEL;
    bankNameLabel = BANK_NAME_LABEL;
    branchNameLabel = BRANCH_NAME_LABEL;
    uploadBankDocumentLabel = UPLOAD_BANK_DOCUMENT_LABEL;
    uploadStatementLabel = bank_statement_file_label
    fileUploadNote=bank_file_note_label;
    bankStatementFileHelptext=bank_statement_file_helptext;
    bankFileUploadHelptext=Bank_File_Upload_HelpText;
    uploadfile=Uploaded_File_Label;
    bankDetailConsent=bank_details_consent;
    bankaccountnumberplaceholder=bank_account_number_placeholder_label;
    bankIFSCcodeplaceholder=bank_IFSC_code_placeholder_label;
    banknameplaceholder=bank_name_placeholder_label;
    bankbranchnameplaceholder=bank_branch_name_placeholder_label;


    maxFiles = 3; // Maximum number of files allowed 
    maxFileSize = 1.5 * 1024 * 1024; // 1.5MB file size limit
    acceptedFormats = ['pdf', 'jpeg', 'jpg', 'png']; // Allowed file types
    validMimeTypes = ['application/pdf', 'image/jpeg', 'image/png']; // Allowed MIME types

isLoading=false;

@track uploadedFiles = []; // List of uploaded files

      // Wire to get the current page reference
      @wire(CurrentPageReference)
      currentPageReference;
      connectedCallback(){
      
      this.applicationId = this.currentPageReference?.state?.Id || null;
      
        this.isLoading=true;
      this.loadBankBasbookFiles();
        if (!this.applicationId) {
         this.showToast('Error', 'Application ID not provided.', 'error');
     }
     }

     async loadBankBasbookFiles() {
        try {
            const DocumentWrapper = await fetchDocumentsByType({documentType: 'Bank Proof' });
            if (DocumentWrapper && DocumentWrapper.length > 0) {
                this.uploadedbankpasbookFiles = DocumentWrapper.map(file => ({
                    contentDocumentId: file.contentDocumentId,
                    name: file.fileName,
                }));
                this.isLoading=false;
              
            } else {
               this.isLoading=false;
            }
        
        } catch (error) {
            this.showToast(Error_Label, 'Failed to load  files.', 'error');
            this.isLoading=false;
        }
    }

     @wire(getRecord, { recordId: USER_ID, fields: CONTACT_ID_FIELD })
     wiredUsercontactid({ error, data }) {
         if (data) {
             this.conRecordId = getFieldValue(data, CONTACT_ID_FIELD); 
              this.fetchBankDetailsbycontactid();
         } else if (error) {
             this.error = error;
          
         }
     }


     fetchBankDetailsbycontactid() {
        getBankDetailsByContactId({ contactId :this.conRecordId})
           .then(result => {
               if (result && result.length > 0) {
                   this.wiredBankDetailsResult=result;
                  
                   const bankDetail = result[0]; // Assuming you're interested in the first record
                   this.bankdetailId=bankDetail.Id;
                   this.bankAccountNumber = bankDetail.Encrypted_Bank_Account_Number__c;
                   this.bankIfscCode = bankDetail.Bank_Ifsc_Code__c;
                   this.bankName = bankDetail.Name;
                   this.bankAddress = bankDetail.Branch_Name__c;
                   this.termsAccepted =bankDetail.Bank_Details_Consent__c;
                  
               } 
           })
           .catch(error => {
              
            this.error=error;
            
           });
   }



 handleBankFileUpload(event) {
        
        const files = Array.from(event.target.files);
        const fileInput = event.target;
        const newFilesCount = files.length;
        const existingFilesCount = this.uploadedbankpasbookFiles.length;

        // Reset custom validity
        fileInput.setCustomValidity('');

        // Validate if the total number of files (existing + new) exceeds the maximum limit
        if (newFilesCount + existingFilesCount > this.maxFiles) {
            const errorMessage = MAX_3_FILE_ERROR_CUSTOM_LABEL;
            this.showToast(Error_Label, errorMessage, 'error');
            return;
        }

        // Check internet connectivity before proceeding
        if (!navigator.onLine) {
            const errorMessage = NO_INTERNET_CONNECTION_LABEL;
            this.showToast(Error_Label, errorMessage, 'error');
            return;
        }

        // Perform file validations before proceeding
        const validFiles = this.validatebankpassbookFiles(files, fileInput);

        // Proceed with file upload if validations pass
        if (validFiles.length > 0) {
            this.uploadbankpasbookFiles(validFiles);
        }
    }

     /**
     * @description Validates the selected files before uploading.
     *              Checks for valid format, size, and duplicates.
     * @param {File[]} files - List of selected files to be validated.
     * @param {HTMLInputElement} fileInput - The file input element to set custom validity.
     * @return {File[]} - A list of valid files that pass all validations.
     */
     validatebankpassbookFiles(files, fileInput) {
        const validFiles = [];
        const existingFileNames = new Set(this.uploadedbankpasbookFiles.map(file => file.name.toLowerCase()));
        for (let file of files) {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const fileMimeType = file.type.toLowerCase();
            const fileSize = file.size;
            const fileName = file.name.toLowerCase();

            // 1. Validate file format
            if (!this.acceptedFormats.includes(fileExtension)) {
                const errorMessage = INVALID_FILE_TYPE_ERROR_CUSTOM_LABEL;
                this.showToast(Error_Label, errorMessage, 'error');
                fileInput.setCustomValidity(errorMessage);
                fileInput.reportValidity();
                return []; // Stop further processing
            }

            // 2. Validate MIME Type (based on file content)
            if (!this.validMimeTypes.includes(fileMimeType)) {
                const errorMessage = INVALID_FILE_TYPE_ERROR_CUSTOM_LABEL;
                this.showToast(Error_Label, errorMessage, 'error');
                fileInput.setCustomValidity(errorMessage);
                fileInput.reportValidity();
                return []; // Stop further processing
            }

            // 3. Validate file size
            if (fileSize > this.maxFileSize) {
                const errorMessage = FILE_SIZE_ERROR;
                this.showToast(Error_Label, errorMessage, 'error');
                fileInput.setCustomValidity(errorMessage);
                fileInput.reportValidity();
                return []; // Stop further processing
            }

            // 4. Validate for duplicate uploads
            if (existingFileNames.has(fileName)) {
                const errorMessage = DUPLICATE_FILE_FOUND_LABEL +' : '+file.name;
                this.showToast(Error_Label, errorMessage, 'error');
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
 async uploadbankpasbookFiles(files) {

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
                documentTypeList: ['Bank Proof'],
                applicationId: this.applicationId
            });

           
            // If there's a valid ContentDocumentId, add it to the uploaded files array
            if (contentDocumentIds && contentDocumentIds.length > 0) {
                const contentDocumentId = contentDocumentIds[0];
                // Add the file information along with the ContentDocumentId to uploadedFiles
                this.uploadedbankpasbookFiles = [
                    ...this.uploadedbankpasbookFiles, 
                    {
                        name: file.name,
                        contentDocumentId: contentDocumentId 
                    }
                ];
                successfulUploads.push(file.name);
                this.showToast(Success_Label, FILE_UPLOADED_SUCCESSFULLY_LABEL, 'success');
                this.isLoading = false;

                const statementfileElement = this.template.querySelector('[data-id="statement-file"]');
                if (statementfileElement) {
                    statementfileElement.required = false;
                    statementfileElement.setCustomValidity(''); // Clear any custom validity message
                    statementfileElement.reportValidity(); 
                }

            } else {
                
                this.showToast(Error_Label, `Failed to upload ${file.name}.`, 'error');
                this.isLoading = false;
            }
        }
    } catch (error) {
        this.showToast(Error_Label, 'Failed to upload a file. Please try again.', 'error');
        this.isLoading = false;
    } finally {
        this.isLoading = false;
        this.clearFileInput();
    }
}

  /**
     * @description Deletes a file based on its ContentDocumentId and updates the UI.
     * @param {Event} event - The click event triggered by the delete button.
     */
  handlebankpassbookFileRemove(event) {
    this.isLoading=true;  //when aadhar is deleteing show spinner
    const contentDocumentId = event.currentTarget.dataset.id;
    
    // Call the Apex method to delete the file from Salesforce
    deleteFileByContentDocumentId({ contentDocumentId:contentDocumentId })
        .then(() => {
            this.isLoading=false;
            this.showToast(Success_Label, FILE_DELETED_SUCCESSFULLY_LABEL, 'success');
            const updatedFiles = this.uploadedbankpasbookFiles.filter(file => file.contentDocumentId !== contentDocumentId);
            this.uploadedbankpasbookFiles = [...updatedFiles];        
        })
        .catch(error => {
            this.isLoading=false;
            this.showToast(Error_Label, 'Failed to delete the file. Please try again.', 'error');
        });
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
            this.showToast(Error_Label, 'Failed to preview the file. Please try again.', 'error');
        });
}

clearFileInput() {
    const agreementFileInput = this.template.querySelector('.scholarship-agreement-file-upload-input');
    agreementFileInput.value = ''; // Reset the file input
}


handleDragOver(event){
        event.dataTransfer.dropEffect = 'none';
    }


    handleAccountNumberChange(event) {
            this.bankAccountNumber = event.target.value.trim();
            // Clear the custom validity message and revalidate the input field
            event.target.setCustomValidity('');
            event.target.reportValidity();
        }

    // Restricts input to numbers only for the Bank Account Number
    handleaccountnumberinput(event) {
            const pattern = /^[0-9]*$/; // Allow only numbers
    
            let inputChar = event.data || '';
            if (!pattern.test(inputChar)) {
                event.preventDefault();
                }
        }

    // Restricts input to alphanumeric characters only for the IFSC Code
        handPressifscinput(event) {
            const pattern = /^[a-zA-Z0-9]*$/; // Allow only alphabets and numbers

            let inputChar = event.data || '';
            if (!pattern.test(inputChar)) {
                event.preventDefault();
            }
        }
        
        // Restricts input to non-digit characters and prevents emojis for Bank Name and Branch Name
       
 handleBankNameBranchInput(event) {
            let inputChar = event.data || '';
        
            // Regular expression to prevent emojis
            let emojiPattern = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
        
            // Prevent default behavior if inputChar matches the emoji pattern
            if (emojiPattern.test(inputChar)) {
                event.preventDefault();
                return;
            }
        }

            // Handles changes in the IFSC Code input field
 handleIfscChange(event) {
                // Clear the custom validity message and revalidate the input field
                event.target.setCustomValidity('');
                event.target.reportValidity();
            this.bankIfscCode = event.target.value.trim().toUpperCase();
                
        }

        // Handles changes in the Bank Name input field
        handlebanknameInputChange(event)
        {
            this.bankName=event.target.value.replace(/\s+/g,' ').trim();
            // Clear the custom validity message and revalidate the input field
            event.target.setCustomValidity('');
            event.target.reportValidity();
        }
            // Handles changes in the Branch Name input field
        handlebranchnameInputChange(event)
        {
            this.bankAddress=event.target.value.replace(/\s+/g,' ').trim();
            // Clear the custom validity message and revalidate the input field
            event.target.setCustomValidity('');
            event.target.reportValidity();
        }

   
        handleConsentChange(event) {
            this.termsAccepted = event.target.checked;
            this.consentcheckerror = false;
            event.target.setCustomValidity('');
            event.target.reportValidity();
        }
        handleback()
        {
            this.showagreement=false;
        }   


handleSave() {
    try {
        // Show the spinner when the save operation starts
        this.isLoading = true;

        if (!navigator.onLine) {
            const errorMessage = NO_INTERNET_CONNECTION_LABEL;
            this.showToast(Error_Label, errorMessage, 'error');
            this.isLoading = false;
            return;
        }

        if (this.validateForm()) {
            // Load bank passbook and statement files before creating the bank record
            Promise.all([this.loadBankBasbookFile()])
                .then(results => {
                    const [passbookLoaded] = results;
                    // Check if both results indicate success
                    if (passbookLoaded) {
                        // Check if a bank record exists
                        if (!this.bankdetailId) {
                            // If no existing bank record, create a new one
                            return this.createBankRecord()
                                .then(bankRecord => {
                                    this.bankdetailId = bankRecord.id; // Store the new bank record ID
                                    return this.updateApplicationStatus();
                                })
                                .then(() => {
                                    this.showToast(Success_Label, bank_submit_toast_message_label, 'success');
                                    this.navigateToHomePage();
                                });
                        } else {
                            // If a bank record exists, update it
                            return this.updateBankRecord()
                                .then(() => this.updateApplicationStatus())
                                .then(() => {
                                    this.showToast(Success_Label, bank_submit_toast_message_label, 'success');
                                    this.navigateToHomePage();
                                });
                        }
                    } else {
                        // Show toast if any of the file uploads are missing
                        this.showToast(Error_Label, bank_file_upload_error_message, 'error');
                        this.isLoading = false;
                    }
                })
                .catch(error => {
                    this.showToast('Error', error.body ? error.body.message : 'An unexpected error occurred.', 'error');
                    this.isLoading = false;
                })
                .finally(() => {
                    this.isLoading = false;
                });
        } else {
            this.scrollToTop();
            this.showToast(Error_Label, Form_error_custom_label, 'error');
            this.isLoading = false;
        }
    } catch (error) {
        this.showToast(Error_Label, Form_error_custom_label, 'error');
        this.isLoading = false;
    }
}

createBankRecord() {
    const fields = {
        'Name': this.bankName,
        'Bank_Ifsc_Code__c': this.bankIfscCode,
        'Branch_Name__c': this.bankAddress,
        'Encrypted_Bank_Account_Number__c': this.bankAccountNumber,
        'Bank_Details_Consent__c': this.termsAccepted,
        'Contact__c': this.conRecordId
    };
    return createRecord({ apiName: 'Bank_Detail__c', fields })
        .then(bankRecord => {
            this.bankdetailId = bankRecord.id;
            return bankRecord;
        });
}

updateApplicationStatus() {
    const fields = {
        [EXTERNAL_APPLICATION_STATUS.fieldApiName]: 'Application Under Review',
        [Application_Internal_Status__c.fieldApiName]: 'Offer Acceptance Document Submitted',
        'Id': this.applicationId
    };
    return updateRecord({ fields });
}

updateBankRecord() {
    const fields = {
        'Id': this.bankdetailId, // Use the existing bank record ID
        'Name': this.bankName,
        'Bank_Ifsc_Code__c': this.bankIfscCode,
        'Branch_Name__c': this.bankAddress,
        'Encrypted_Bank_Account_Number__c': this.bankAccountNumber,
        'Bank_Details_Consent__c': this.termsAccepted,
        'Contact__c': this.conRecordId
    };
    return updateRecord({ fields });
}


scrollToTop() {
    this.template.querySelector('div.slds-card__body').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

 
    
    validateForm() {

        const inputs = [...this.template.querySelectorAll('lightning-input,input')];
        let allValid = true;
    
        inputs.forEach(input => {
            // Checkbox validation for terms and conditions
            if (input.type === 'checkbox') {
                if (!input.checked) {
                this.consentcheckerror = true; 
                allValid = false;   
                } else {
                  this.consentcheckerror = false;     
                }
            } 

            // General input field validation (non-empty check)
            if (input.name === 'bankname') {
                if (!input.value || !input.value.trim()) {
                    input.setCustomValidity(Complete_this_field_Label);
                    allValid = false;
                } else {
                    input.setCustomValidity('');
                }
            }
    
            if (input.name === 'branchname') {
                if (!input.value || !input.value.trim()) {
                    input.setCustomValidity(Complete_this_field_Label);
                    allValid = false;
                } else {
                    input.setCustomValidity('');
                }
            }

            // File input validation
            if (input.type === 'file') {
                if (this.uploadedbankpasbookFiles.length === 0) {
                    input.setCustomValidity(Complete_this_field_Label);
                    allValid = false;
                } else {
                    input.setCustomValidity('');
                }
            }
    
            // Bank Account Number validation
            if (input.name === 'bankaccountinput') {
                const bankAccountValue = this.bankAccountNumber?.trim();  // Trim for safety
                if (!bankAccountValue) {
                    
                    input.setCustomValidity(Complete_this_field_Label);
                    allValid = false;
                }  else {
                    input.setCustomValidity('');
                }
            }
    
            // Bank IFSC Code validation
            if (input.name === 'bankifsc') {
                
                const ifscValue = this.bankIfscCode?.trim().toUpperCase();  // Ensure it's uppercase and trimmed
     
                if (!ifscValue) {
                    input.setCustomValidity(Complete_this_field_Label);
                    allValid = false;
                } else {
                        input.setCustomValidity('');
                    }
                }
            
    
            // Report validity for each input field
            input.reportValidity();
        });
    
        return allValid;
    }

    async loadBankBasbookFile() {
        try {
            const DocumentWrapper = await fetchDocumentsByType({ documentType: 'Bank Proof' });
    
            if (DocumentWrapper && DocumentWrapper.length > 0) {
                this.uploadedbankpasbookFiles = DocumentWrapper.map(file => ({
                    contentDocumentId: file.contentDocumentId,
                    name: file.fileName,
                }));
                return true; // Indicate success
            } else {
                return false; // Indicate failure
            }
        } catch (error) {
           
            return false; // Indicate failure on error
        }
    }
    
 showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
    navigateToHomePage() {
        window.location.href=`${basePath}/`;
}
}