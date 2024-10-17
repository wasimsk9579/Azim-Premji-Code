/**
 * @description       : Will ensure one scholarship edition is active per scholarship at CRM level.
 * @author            : owais.ahanger@cloudodyssey.co
 * @last modified on  : 22-07-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
 * Test Class		  : APFS_OneActiveEditionScholarshipTest
**/
trigger APFS_EnsureOneActiveEditionPerScholarship on Scholarship_Edition__c (before insert, before update) {
    // Set to store IDs of Scholarships to be processed
    Set<Id> scholarshipIds = new Set<Id>();

    // Collect Scholarship IDs from records being inserted/updated
    for (Scholarship_Edition__c edition : Trigger.new) {
        if (edition.Is_Active_Edition__c) {
            scholarshipIds.add(edition.Scholarship__c);
        }
    }

    // Query existing active editions for the collected Scholarships
    Map<Id, Scholarship_Edition__c> activeEditionsMap = new Map<Id, Scholarship_Edition__c>();
    if (!scholarshipIds.isEmpty()) {
        for (Scholarship_Edition__c edition : [
            SELECT Id, Scholarship__c 
            FROM Scholarship_Edition__c 
            WHERE Is_Active_Edition__c = true 
              AND Scholarship__c IN :scholarshipIds
        ]) {
            activeEditionsMap.put(edition.Scholarship__c, edition);
        }
    }

    // Check for conflicts and add errors
    for (Scholarship_Edition__c edition : Trigger.new) {
        if (edition.Is_Active_Edition__c) {
            Scholarship_Edition__c existingActiveEdition = activeEditionsMap.get(edition.Scholarship__c);
            if (existingActiveEdition != null && existingActiveEdition.Id != edition.Id) {
                edition.addError('Only one active edition is allowed per Scholarship.Please deactivate the previous edition and then continue.');
            }
        }
    }
}