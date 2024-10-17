/**
 * @description       : Will ensure one scholarship round is active per scholarship edition at CRM level.
 * @author            : owais.ahanger@cloudodyssey.co
 * @last modified on  : 22-07-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
 * Test Class		  : APFS_EnsureOneActiveRoundPSE_Test
**/
trigger APFS_EnsureOneActiveRoundPerScholarshipEdition on Scholarship_Round__c (before insert, before update) {
    // Set to store IDs of Scholarship Editions to be processed
    Set<Id> scholarshipEditionIds = new Set<Id>();

    // Collect Scholarship Edition IDs from records being inserted/updated
    for (Scholarship_Round__c round : Trigger.new) {
        if (round.Is_Active_Round__c) {
            scholarshipEditionIds.add(round.Scholarship_Edition__c);
        }
    }

    // Query existing active rounds for the collected Scholarship Editions
    Map<Id, Scholarship_Round__c> activeRoundsMap = new Map<Id, Scholarship_Round__c>();
    if (!scholarshipEditionIds.isEmpty()) {
        for (Scholarship_Round__c round : [
            SELECT Id, Scholarship_Edition__c 
            FROM Scholarship_Round__c 
            WHERE Is_Active_Round__c = true 
              AND Scholarship_Edition__c IN :scholarshipEditionIds
        ]) {
            activeRoundsMap.put(round.Scholarship_Edition__c, round);
        }
    }

    // Check for conflicts and add errors 
    for (Scholarship_Round__c round : Trigger.new) {
        if (round.Is_Active_Round__c) {
            Scholarship_Round__c existingActiveRound = activeRoundsMap.get(round.Scholarship_Edition__c);
            if (existingActiveRound != null && existingActiveRound.Id != round.Id) {
                round.addError('Only one active round is allowed per Scholarship Edition.Please deactivate the previous round and then continue.');
            }
        }
    }
}