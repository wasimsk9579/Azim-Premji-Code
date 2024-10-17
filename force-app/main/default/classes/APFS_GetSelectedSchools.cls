public class APFS_GetSelectedSchools {
 public List<School__c> schools{get;private set;}
    public APFS_GetSelectedSchools(ApexPages.StandardSetController stdSetController){
        // Returns all selected records
        schools = (List<School__c>) stdSetController.getSelected();
    }
    
    public PageReference save(){
        try{
         update schools;
        } catch(Exception e){
            System.debug('Exception: ' + e);
        }
        return null;
    }
     @AuraEnabled(cacheable=true)
    public static List<School__c> fetchRecords(String picklistValue1, String picklistValue2) {
        // Construct dynamic SOQL query based on picklist values
        String query = 'SELECT Id, Name,School_Location__c,School_Management__c FROM School__c where Id!=null';
        
        if (String.isNotEmpty(picklistValue1)) {
            query += ' AND School_Location__c = :picklistValue1';
        }
        
        if (String.isNotEmpty(picklistValue2)) {
            query += ' AND School_Management__c = :picklistValue2';
        }
        
        return Database.query(query);
    }
    
    @AuraEnabled
    public static void updateSchoolLocation(List<Id> recordIds, String newLocation) {
        // Validate input parameters
        if (recordIds == null || recordIds.isEmpty()) {
            throw new APFS_CustomException('No records to update.');
        }
        if (String.isEmpty(newLocation)) {
            throw new APFS_CustomException('No location value provided.');
        }

        // Query the records that need to be updated
        List<School__c> schoolsToUpdate = [SELECT Id, School_Location__c FROM School__c WHERE Id IN :recordIds];
        if (schoolsToUpdate.isEmpty()) {
            throw new APFS_CustomException('No records found for the provided IDs.');
        }
        for (School__c school : schoolsToUpdate) {
            school.School_Location__c = newLocation;
        }
         Database.SaveResult[] results = Database.update(schoolsToUpdate, false);

        for (Database.SaveResult result : results) {
            if (!result.isSuccess()) {
                String errorMessage = 'Error updating record with ID ' + result.getId() + ': ' + result.getErrors()[0].getMessage();
                throw new APFS_CustomException(errorMessage);
            }
        }
    }
}