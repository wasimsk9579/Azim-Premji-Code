@isTest
public class APFS_EnsureOneActiveRoundPSE_Test {
    
    @isTest
    static void testEnsureOneActiveRound() {
        Integer currentYear = Date.today().year();
        String nextYear = String.valueOf(currentYear + 1);
        String thirdYear = String.valueOf(currentYear + 2);
        
        System.debug('Current Year: ' + currentYear);
        System.debug('Next Year: ' + nextYear);
        System.debug('Third Year: ' + thirdYear);
        Scholarship__c scholarship = new Scholarship__c(
            Scholarship_Name__c = 'Azim' 
        );
        insert scholarship;
        Scholarship_Edition__c edition1 = new Scholarship_Edition__c(
            Scholarship__c = scholarship.Id,
            Number_Of_Installments_Per_Year__c = 12, 
            Total_Amount_Per_Installment__c = 1000.00, 
            Year__c = nextYear
        );
        insert edition1;
        List<Scholarship_Round__c> activeRoundsEdition1 = [SELECT Id, Is_Active_Round__c FROM Scholarship_Round__c WHERE Scholarship_Edition__c = :edition1.Id AND Is_Active_Round__c = true];
        if (!activeRoundsEdition1.isEmpty()) {
            activeRoundsEdition1[0].Is_Active_Round__c = false;
            update activeRoundsEdition1[0];
        }
        Scholarship_Round__c activeRound1 = new Scholarship_Round__c(
            Scholarship_Edition__c = edition1.Id,
            Is_Active_Round__c = true,
            Round_End_Date__c = Date.today().addMonths(1),
            Round_Type__c = 'Regular', 
            Round_Number__c = 1
        );
        insert activeRound1;
        Scholarship_Round__c inactiveRound1 = new Scholarship_Round__c(
            Scholarship_Edition__c = edition1.Id,
            Is_Active_Round__c = false,
            Round_End_Date__c = Date.today().addMonths(1),
            Round_Type__c = 'Regular', 
            Round_Number__c = 1 
        );
        insert inactiveRound1;
        Scholarship_Round__c newActiveRound1 = new Scholarship_Round__c(
            Scholarship_Edition__c = edition1.Id,
            Is_Active_Round__c = true,
            Round_End_Date__c = Date.today().addMonths(2),
            Round_Type__c = 'Regular',
            Round_Number__c = 2 
        );
        
        try {
            insert newActiveRound1;
            System.assert(false, 'Expected DmlException but no exception was thrown.');
        } catch (DmlException e) {
            System.assert(e.getMessage().contains('Only one active round is allowed per Scholarship Edition'), 'Incorrect error message');
        }
    }
}