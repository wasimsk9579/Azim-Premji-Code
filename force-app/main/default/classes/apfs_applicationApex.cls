public class apfs_applicationApex {
    
    public class ScholarshipWrapper {
        @AuraEnabled public List<Scholarship_Round__c> scholarshipRoundData { get; set; }
        @AuraEnabled public List<Scholarship_Edition__c> scholarshipEditionData { get; set; }
        @AuraEnabled public List<Scholarship__c> scholarshipData { get; set; }

        public ScholarshipWrapper() {
            scholarshipRoundData = new List<Scholarship_Round__c>();
            scholarshipEditionData = new List<Scholarship_Edition__c>();
            scholarshipData = new List<Scholarship__c>();
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static ScholarshipWrapper getActiveScholarshipData() {
        ScholarshipWrapper wrapper = new ScholarshipWrapper();

        try {
            // Retrieve active Scholarship Rounds
            wrapper.scholarshipRoundData = [
                SELECT Id, Scholarship_Edition__c, Name, Is_Active_Round__c 
                FROM Scholarship_Round__c 
                WHERE Is_Active_Round__c = true
            ];

            // Retrieve active Scholarship Editions
            wrapper.scholarshipEditionData = [
                SELECT Id, Scholarship__c, Name, Is_Active_Edition__c 
                FROM Scholarship_Edition__c 
                WHERE Is_Active_Edition__c = true
            ];

            // Retrieve active Scholarships
            wrapper.scholarshipData = [
                SELECT Id, Name, Is_Active__c 
                FROM Scholarship__c 
                WHERE Is_Active__c = true
            ];
        } catch (Exception e) {
            throw new APFS_CustomException('Error fetching scholarship data: ' + e.getMessage());
        }

        return wrapper;
    }
}