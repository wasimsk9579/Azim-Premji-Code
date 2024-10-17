import { LightningElement, wire, track } from 'lwc';
import fetchRecords from '@salesforce/apex/APFS_GetSelectedSchools.fetchRecords';
import updateSchoolLocation from '@salesforce/apex/APFS_GetSelectedSchools.updateSchoolLocation';
import LightningAlert from 'lightning/alert';

export default class ApplicationTable extends LightningElement {
    @track picklistValue1 = '';
    @track picklistValue2 = '';
    @track records;
    @track selectedRows = [];
    @track isLoading = false; 
    @track updatePicklistValue = ''; 
    @track columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'School_Location__c', fieldName: 'School_Location__c' },
        { label: 'School_Management__c', fieldName: 'School_Management__c' },
    ];

    @track picklistOptions1 = [
        { label: 'Rural', value: 'Rural' },
        { label: 'Urban', value: 'Urban' }
    ];

    @track picklistOptions2 = [
        { label: 'Central Tibetan School', value: 'Central Tibetan School' },
        { label: 'Department of Education', value: 'Department of Education' }
    ];

    handlePicklist1Change(event) {
        this.picklistValue1 = event.detail.value;
    }

    handlePicklist2Change(event) {
        this.picklistValue2 = event.detail.value;
    }

    async handleFetchRecords() {
        this.isLoading = true;
        try {
            const result = await fetchRecords({
                picklistValue1: this.picklistValue1,
                picklistValue2: this.picklistValue2
            });
            this.records = result;
            console.log('Records fetched:', JSON.stringify(this.records));
        } catch (error) {
            console.error('Error fetching records:', error);
            this.showAlert(error.body.message ? error.body.message : 'Error fetching records.Please try again','error','Error');
            // await LightningAlert.open({
            //     message: error.body.message ? error.body.message : 'Error fetching records.Please try again',
            //     theme: "error",
            //     label: "Error!"
            // });
        } finally {
            this.isLoading = false;
        }
    }
    
    async handleRowSelection(event) {
        let selectedRows = event.detail.selectedRows;
    
        if (selectedRows.length > 999) {
            this.showAlert('You cannot select more than 1000 records. Only the first 1000 records have been selected.','warning','Warning');
            // await LightningAlert.open({
            //     message: 'You cannot select more than 1000 records. Only the first 1000 records have been selected.',
            //     theme: 'warning',
            //     label: 'Warning',
            // });
    
            selectedRows = selectedRows.slice(0, 1000);
        }
    
        this.selectedRows = selectedRows.map(row => row.Id);

        console.log('Selected rows:', JSON.stringify(this.selectedRows));
    }


    handlePicklistUpdateChange(event) {
        this.updatePicklistValue = event.detail.value;
    }
    async handleUpdateRecords() {
        if (!this.updatePicklistValue) {
            await this.showAlert('No picklist value selected for update.','warning','Warning');
            return;
        }
    
        this.isLoading = true;
        console.log('Updating selected records with new location:', this.updatePicklistValue);
        
        try {
            await updateSchoolLocation({ 
                recordIds: this.selectedRows, 
                newLocation: this.updatePicklistValue 
            });
            await this.showSuccessAlert('Records updated successfully.','success','Success');
            // await LightningAlert.open({
            //     message: 'Records updated successfully.',
            //     theme: 'success',
            //     label: 'Success',
            // });
            // await this.handleFetchRecords(); 
        } catch (error) {
            console.error('Error updating records:', error); 
            await this.showAlert(error.body.message ? error.body.message : 'There was an error updating the records.Please try again','error','Error');
            // await LightningAlert.open({
            //     message: error.body.message ? error.body.message : 'There was an error updating the records.Please try again',
            //     theme: 'error',
            //     label: 'Error',
            // });
        } finally {
            this.isLoading = false;
            this.updatePicklistValue = ''; 
            this.selectedRows = [];
            this.picklistValue1 = '';
            this.picklistValue2 = '';
        }
    }
    
    showSuccessAlert(message,theme,label){
        LightningAlert.open({
          message: message,
          theme: theme,
          label: label,
      }).then(() => {
        this.template.querySelector('lightning-datatable').selectedRows = [];
        this.handleFetchRecords(); 
      });
      }
      showAlert(message,theme,label){
        LightningAlert.open({
          message: message,
          theme: theme,
          label: label,
      })
      }
}