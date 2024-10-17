import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ApfsSocioEconomicDetails extends LightningElement {
    speciallyAbledPerson;
    disabilityType;
    otherDisability;
    religion;
    otherReligion;
    category;
    communityName;
    familyStatus;
    motherName;
    mothersLivingStatus;
    motherLivingStatus;
    fathersLivingStatus;
    fatherLivingStatus;
    guardianName;
    guardianEducationalDetails;
    familyIncome;
    familyMember;

    isSpeciallyAbled = false;
    isOtherDisability = false;
    isOtherReligion = false;
    isOtherFamilyStatus = false;
    isMotherLivingStatus = false;
    isFatherLivingStatus = false;
    isCommunity = false;

    speciallyAbledPersonOptions = [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }];
    disabilityTypeOptions = [{ label: 'Visual Impairment', value: 'Visual Impairment' }, { label: 'Hearing Impairment', value: 'Hearing Impairment' }, { label: 'Speech and Language Disability', value: 'Speech and Language Disability' }, { label: 'Locomotor Disability', value: 'Locomotor Disability' }, { label: 'Others', value: 'Others' }];
    religionOptions = [{ label: 'Hindu', value: 'Hindu' }, { label: 'Muslim', value: 'Muslim' }, { label: 'Christian', value: 'Christian' }, { label: 'Sikh', value: 'Sikh' }, { label: 'Buddhist', value: 'Buddhist' }, { label: 'Others', value: 'Others' }];
    categoryOptions = [{ label: 'SC', value: 'SC' }, { label: 'ST', value: 'ST' }, { label: 'OBC', value: 'OBC' }, { label: 'General', value: 'General' }, { label: 'Others', value: 'Others' }];
    familyStatusOptions = this.categoryOptions;
    livingStatusOptions = [{ label: 'Living', value: 'Living' }, { label: 'Deceased', value: 'Deceased' }];

    errors = {};

    handleChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.detail.value;
        this[fieldName] = fieldValue;

        if (fieldName === 'speciallyAbledPerson') {
            this.isSpeciallyAbled = fieldValue === 'Yes';
        } else if (fieldName === 'disabilityType') {
            this.isOtherDisability = fieldValue === 'Others';
        } else if (fieldName === 'religion') {
            this.isOtherReligion = fieldValue === 'Others';
        } else if (fieldName === 'category') {
            this.isCommunity = fieldValue === 'Others';
        } else if (fieldName === 'familyStatus') {
            this.isOtherFamilyStatus = fieldValue === 'Others';
        } else if (fieldName === 'mothersLivingStatus') {
            this.isMotherLivingStatus = fieldValue === 'Living';
        } else if (fieldName === 'fathersLivingStatus') {
            this.isFatherLivingStatus = fieldValue === 'Living';
        }
    }

    handleSaveAndContinue() {
        try {
             
            fieldValues.forEach((field, index) => {
                if (field === null || field === undefined) {
                    allFieldsValid = false;
                    this.errors[`field${index}`] = 'This field is required';  
                }
            });
    
            if (!allFieldsValid) {
                this.showToast('Error', 'fill all the required fields.', 'error');
                console.log('errors --->', JSON.stringify(this.errors));
            } else {
                this.showToast('Success', 'Submitted successfully', 'success');
            }
    
            return allFieldsValid;
        } catch (error) {
            console.error('Error in handleSaveAndContinue:', error);
            this.showToast('Error', 'An unexpected error occurred', 'error');
            return false;
        }
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
}
}