/**
 * @description       : 
 * @author            : owais.ahanger@cloudodyssey.co
 * @group             : 
 * @last modified on  : 09-16-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
import { LightningElement,track } from 'lwc';
import SR_APFS from '@salesforce/resourceUrl/SR_APFS';
import PROFILE_PICTURE_UPLOAD_LABEL from '@salesforce/label/c.Upload_Profile_Picture_label';
import ERROR_LABEL from '@salesforce/label/c.Error_Label';
import PROFILE_PICTURE_SIZE_ERROR_LABEL from '@salesforce/label/c.Profile_Picture_Size_Error';
import INVALID_PROFILE_PICTURE__LABEL from '@salesforce/label/c.Invalid_Profile_Picture';
import NO_INTERNET_CONNECTION_LABEL from '@salesforce/label/c.No_Internet_Connection_label';
import SUCCESS_TOAST_LABEL from '@salesforce/label/c.Success_Label';
import PROFILE_PICTURE_UPLOAD_SUCCESS_LABEL from '@salesforce/label/c.Profile_Picture_Upload_Success';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import uploadFilesToServer from '@salesforce/apex/APFS_MyProfileDocumentsController.uploadFilesToServer';
import fetchDocumentsByType from '@salesforce/apex/APFS_MyProfileDocumentsController.fetchDocumentsByType';

export default class ApfsCoUploadProfilePhoto extends LightningElement {

  
    defaultProfilePhotoUrl =`${SR_APFS}/SR_APFS/Icons/user-icon.jpg`;

    isProfilePhotoUploading = false;
    isProfilePhotoUploaded = false;




     /**
     * @description Fetches the existing "Self Photo" document associated with the current contact and display it.
     */
     async loadExistingProfilePhoto() {
        try {
            // Fetch ContentDocumentId of the existing "Self Photo"
            const DocumentWrapper = await fetchDocumentsByType({ documentType: 'Self Photo' });

            // If a valid document exists, update the profile photo URL
            if (DocumentWrapper && DocumentWrapper.length > 0) {
                const contentDocumentId = DocumentWrapper[0].contentDocumentId;
                this.defaultProfilePhotoUrl = `/sfc/servlet.shepherd/document/download/${contentDocumentId}`;
                this.isProfilePhotoUploaded=true;
            }
            else {
                this.isProfilePhotoUploaded = false; // No photo found
            }
            // Dispatch the upload status to the parent
            this.dispatchProfilePhotoUploadStatus();
        } catch (error) {
             // Dispatch the upload status to the parent
           
            this.showToast(ERROR_LABEL,  error.body.message ? error.body.message : 'Failed to load profile picture.', 'error');
        }
    }


  /**
   * @description Opens the file input dialog to allow the user to select a profile photo.
   * @fires Event - Click event is triggered on the hidden file input element.
   */
  handleProfilePhotoCameraButtonClick() {
      const hiddenProfilePhotoInputFileElement = this.template.querySelector('.profile-photo-input-file');
      hiddenProfilePhotoInputFileElement.click();
  }

  /**
   * @description Handles the file selection and performs file validations such as type, size, and internet connectivity.
   *              If all validations pass, it proceeds with the file upload process.
   * @param {Event} event - The file input change event that contains the selected file.
   */
  handleProfilePhotoUpload(event) {
      const profilePhotoFileInput = event.target;
      const file = profilePhotoFileInput.files[0];

      if (!file) {
          this.showToast(ERROR_LABEL, PROFILE_PICTURE_UPLOAD_LABEL,'error');
          this.clearFileInput();
          return;
      }

      // 1. Validate File Extension (based on file name)
      const validExtensions = ['jpeg', 'jpg', 'png'];
      const fileExtension = file.name.split('.').pop().toLowerCase();
       
      if (!validExtensions.includes(fileExtension)) {
          this.showToast(ERROR_LABEL, INVALID_PROFILE_PICTURE__LABEL,'error');
          this.clearFileInput();
          return;
      }

      // 2. Validate MIME Type (based on file content)
      const validMimeTypes = ['image/jpeg', 'image/png'];
      const fileMimeType = file.type.toLowerCase();

      if (!validMimeTypes.includes(fileMimeType)) {
          this.showToast(ERROR_LABEL, INVALID_PROFILE_PICTURE__LABEL,'error');
          this.clearFileInput();
          return;
      }

      // 3. Validate file size (3MB limit)
      const maxFileSize = 3 * 1024 * 1024; // 3 MB
      if (file.size > maxFileSize) {
          this.showToast(ERROR_LABEL,PROFILE_PICTURE_SIZE_ERROR_LABEL,'error');
          this.clearFileInput();
          return;
      }

      // 4. Validate that the file is not empty (0KB)
      if (file.size === 0) {
          this.showToast(ERROR_LABEL, 'The file is empty. Please upload a valid file.','error');
          this.clearFileInput();
          return;
      }

      // 5. Check internet connectivity
      if (!navigator.onLine) {
          this.showToast(ERROR_LABEL, NO_INTERNET_CONNECTION_LABEL,'error');
          this.clearFileInput();
          return;
      }

       // Use a fixed file name "Profile_Photo" with the original extension
       const fixedFileName = `Profile_Photo.${fileExtension}`;
       this.uploadFile(file, fixedFileName);
      
  }


/**
 * @description Uploads the valid file to the server by converting it to Base64 using async/await.
 * @param {File} file - The selected file to be uploaded.
 * @param {String} fileName - The file name to use for the upload.
 */
async uploadFile(file, fileName) {
    // Start the spinner
    this.isProfilePhotoUploading = true;

    // Use a Promise to handle FileReader asynchronously
    const base64 = await this.readFileAsBase64(file);

    try {
        
       const contentDocumentIds= await uploadFilesToServer({
            base64DataList: [base64],
            fileNameList: [fileName],
            documentTypeList: ['Self Photo']
        });

            // If there's a valid ContentDocumentId, update the profile photo URL
            if (contentDocumentIds && contentDocumentIds.length > 0) {
                const contentDocumentId = contentDocumentIds[0];
                this.defaultProfilePhotoUrl = `/sfc/servlet.shepherd/document/download/${contentDocumentId}`;
                this.isProfilePhotoUploaded = true; // Set the flag to true upon success
                this.showToast(SUCCESS_TOAST_LABEL, PROFILE_PICTURE_UPLOAD_SUCCESS_LABEL, 'success');
            }
            else {
                this.isProfilePhotoUploaded = false;
            }
            // Dispatch the upload status to the parent
            this.dispatchProfilePhotoUploadStatus();
    } catch (error) {
        this.isProfilePhotoUploaded = false;
        this.showToast(ERROR_LABEL,  error.body.message ? error.body.message : 'Profile photo upload failed. Please try again.', 'error');
        this.dispatchProfilePhotoUploadStatus();
        
    } finally {
        this.isProfilePhotoUploading = false; // Stop spinner
        this.clearFileInput(); // Clear the file input after upload
    }
}

 /**
     * @description Dispatches a custom event to the parent with the current profile photo upload status.
     */
 dispatchProfilePhotoUploadStatus() {
    const photoUploadEvent = new CustomEvent('photouploadstatus', {
        detail: { isUploaded: this.isProfilePhotoUploaded }
    });
   
    this.dispatchEvent(photoUploadEvent); // Dispatch the event to the parent component
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
      const profilePhotoFileInput = this.template.querySelector('.profile-photo-input-file');
      profilePhotoFileInput.value = ''; // Reset the file input
  }

  /**
   * @description Adds the 'beforeunload' event listener when the component is connected to the DOM.
   *              This prevents the user from leaving the page during the file upload process.
   */
  connectedCallback() {
     // Bind the function to the current context
     this.boundHandleBeforeUnload = this.handleBeforeUnload.bind(this);
      window.addEventListener('beforeunload', this.boundHandleBeforeUnload);

      // Load the existing Self Photo on component load
      this.loadExistingProfilePhoto();
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
      if (this.isProfilePhotoUploading) {
          event.preventDefault();
          
      }
  }
}