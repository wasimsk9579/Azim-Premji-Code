import { LightningElement, api, track } from 'lwc';
import LightningAlert from 'lightning/alert';

export default class ApfsCoEligibility extends LightningElement {
    @api showModal = false;
    @track EligibilityStatus = false;
    @track anyone = false;
    @track isFormValid = true;
    
    // Track the state of each radio button
    @track checkboxState = {
        completedClass12thFromStates: '',
        gradeX: '',
        gradeXII: '',
        securedAdmission: ''
    };
    // Track the values of picklists
    @track gender = '';
   
    // Options for picklists
    genderOptions = [
        { label: 'Male (पुरुष)', value: 'Male' },
        { label: 'Female (महिला)', value: 'Female' }
    ];



    
    yesNoOptions = [
        { label: 'Yes (हाँ)', value: 'Yes' },
        { label: 'No (नहीं)', value: 'No' }
    ];
    // Track the state of each error message
    @track showError = {
        gender: false,
        grades: false,
        securedAdmission: false,
        completedClass12thFromStates: false
    };
    handleChange(event) {
        const fieldId = event.target.dataset.id; // Get the data-id of the radio group
        const selectedValue = event.detail.value;
        
    
        // Get the specific radio group element based on the data-id
        const radioGroup = this.template.querySelector(`[data-id="${fieldId}"]`);
    
        // Apply the appropriate color based on the selected value to the specific radio group
        if (selectedValue === 'Yes') {
            radioGroup.style.setProperty('--slds-c-radio-color-background-checked', '#ffffff'); // Green for Yes
            radioGroup.style.setProperty('--slds-c-radio-mark-color-foreground', '#156622'); // White foreground color
        } else if (selectedValue === 'No') {
            radioGroup.style.setProperty('--slds-c-radio-color-background-checked', '#ffffff'); // Red for No
            radioGroup.style.setProperty('--slds-c-radio-mark-color-foreground', '#f20707'); // White foreground color
        }
    
    
        if (fieldId in this.checkboxState) {
            this.checkboxState[fieldId] = selectedValue;
        } else {
            this[fieldId] = selectedValue;
        }
        // Call checkValidity for the specific field
        this.checkValidity(fieldId);
    }
    @track isValid = true;
    checkValidity(fieldId) {
        // Reset the error message for the specific field
        if (fieldId in this.showError) {
            this.showError[fieldId] = false;
        }
        let errorMessage = '';
        this.anyone = false; // Reset 'anyone' flag
    
        // Validate the specific field
        switch (fieldId) {
            case 'gender':
                if (this.gender === 'Male') {
                    this.isValid = false;
                    this.showError.gender = true;     
                }else{this.isValid = true;}
                break;

            case 'completedClass12thFromStates':
                 if (this.checkboxState.completedClass12thFromStates === 'No') {
                    this.isValid = false;
                    this.showError.completedClass12thFromStates = true;
                } else {
                    this.isValid = true;
                    this.showError.completedClass12thFromStates = false;
                    }
                break;
                
            case 'gradeXII':
            case 'gradeX':
                const { gradeX, gradeXII } = this.checkboxState;
    // Check if two grades are selected
                const allGradesSelected = gradeX && gradeXII;
                // Set 'anyone' to true if not all two radio groups are selected
                if (!allGradesSelected) {
                    this.isValid = false;
                    this.anyone = true;   
                } else {
                    this.isValid = true;
                    this.anyone = false;
                }
                // Check if at least one grade is selected as "Yes"
                const allNo = gradeX ==='No' || gradeXII === 'No';
                if (allNo) {
                   
                    this.isValid = false;
                    this.anyone = false;  
                    this.showError.grades = true;
                    
                } else {
                    this.isValid = true;
                    this.showError.grades = false;
                    // If at least one "Yes" is selected, hide error
                }
                break;
    
            case 'securedAdmission':
                if (this.checkboxState.securedAdmission === 'No') {
                    this.isValid = false;
                    this.showError.securedAdmission = true;
                } else {
                    this.isValid = true;
                    this.showError.securedAdmission = false;
                }
                break;
        }
        // Call to update form validity based on all fields
        this.checkIfAllFieldsCompleted();
        this.errorMessage = errorMessage;
    }
    
    checkIfAllFieldsCompleted() {
        // Get all combobox and radio group elements
        const allComboboxes = this.template.querySelectorAll('lightning-combobox');
        const allRadioGroups = this.template.querySelectorAll('lightning-radio-group');
        // Combine all inputs into one array
        const allInputs = [...allComboboxes, ...allRadioGroups];
        // Check validity of all inputs
        const allValid = allInputs.every(input => {
            // For comboboxes and radio groups, check if value is not empty
            if (input instanceof HTMLSelectElement || input.type === 'radio') {
                return input.value !== '';
            }
            return input.checkValidity();
        });
          if (this.gender === 'Female' && allValid && this.isValid && !this.showError.gender && !this.anyone && !this.showError.grades  && !this.showError.securedAdmission && !this.showError.completedClass12thFromStates) {
            this.isFormValid = false;
            console.log(this.isFormValid);
        } else {
            this.isFormValid = true;
            console.log(this.isFormValid);
        }
    
    }
    
    
    // Handle Check
    confirm(event) {
        event.preventDefault(); // Prevents the form from submitting the traditional way
        if (!(this.isFormValid)) {
            this.EligibilityStatus = true;
            this.showAlert('You are eligible for the scholarship (आप इस स्कॉलरशिप  के लिए पात्र हैं।)', 'success', 'Eligible! (पात्र!)');
            setTimeout(() => {
                this.closeModal();
            }, 1000);
        } else {
            this.focusOnFirstError();
            if (this.errorMessage) {
                this.template.querySelector('.error-message').textContent = this.errorMessage;
            }
        }
    }
    closeModal() {
        this.dispatchEvent(new CustomEvent('close', {
            detail: {
                eligibilityStatus: this.EligibilityStatus
            }
        }));
    }
 
    showAlert(message, theme, label) {
        LightningAlert.open({
            message: message,
            theme: theme,
            label: label,
        })
    }
}