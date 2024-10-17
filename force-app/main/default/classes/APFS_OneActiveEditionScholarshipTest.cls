@isTest
public class APFS_OneActiveEditionScholarshipTest {

    @isTest
    static void testSingleActiveEditionInsertion() {
        Scholarship__c scholarship = new Scholarship__c(Scholarship_Name__c = 'Test Scholarship');
        insert scholarship;
        Scholarship_Edition__c activeEdition = new Scholarship_Edition__c(
            Scholarship__c = scholarship.Id,
            Total_Amount_Per_Installment__c=300000,
            Number_Of_Installments_Per_Year__c=3,
            Year__c='2024',
            Is_Active_Edition__c = true
        );
        insert activeEdition;
        Scholarship_Edition__c newActiveEdition = new Scholarship_Edition__c(
            Scholarship__c = scholarship.Id,
            Total_Amount_Per_Installment__c=300000,
            Number_Of_Installments_Per_Year__c=3,
            Year__c='2024',
            Is_Active_Edition__c = true
        );

        Test.startTest();
        try {
            insert newActiveEdition;
            System.assert(false, 'Expected DMLException due to trigger preventing multiple active editions.');
        } catch (DmlException e) {
            System.assert(e.getDmlMessage(0).contains('Only one active edition is allowed per Scholarship'), e.getDmlMessage(0));
        }
        Test.stopTest();
    }

    @isTest
    static void testActiveEditionUpdate() {
        Scholarship__c scholarship = new Scholarship__c(Scholarship_Name__c = 'Test Scholarship');
        insert scholarship;
        Scholarship_Edition__c activeEdition = new Scholarship_Edition__c(
            Scholarship__c = scholarship.Id,
            Total_Amount_Per_Installment__c=300000,
            Number_Of_Installments_Per_Year__c=3,
            Year__c='2024',
            Is_Active_Edition__c = true
        );
        insert activeEdition;
        Scholarship_Edition__c inactiveEdition = new Scholarship_Edition__c(
            Scholarship__c = scholarship.Id,
            Total_Amount_Per_Installment__c=300000,
            Number_Of_Installments_Per_Year__c=3,
            Year__c='2025',
            Is_Active_Edition__c = false
        );
        insert inactiveEdition;
        inactiveEdition.Is_Active_Edition__c = true;
        Test.startTest();
        try {
            update inactiveEdition;
            System.assert(false, 'Expected DMLException due to trigger preventing multiple active editions.');
        } catch (DmlException e) {
            System.assert(e.getDmlMessage(0).contains('Only one active edition is allowed per Scholarship'), e.getDmlMessage(0));
        }
        Test.stopTest();
    }

    @isTest
    static void testDeactivateExistingActiveEdition() {
        Scholarship__c scholarship = new Scholarship__c(Scholarship_Name__c = 'Test Scholarship');
        insert scholarship;
        Scholarship_Edition__c activeEdition = new Scholarship_Edition__c(
            Scholarship__c = scholarship.Id,
            Total_Amount_Per_Installment__c=300000,
            Number_Of_Installments_Per_Year__c=3,
            Year__c='2024',
            Is_Active_Edition__c = true
        );
        insert activeEdition;

        activeEdition.Is_Active_Edition__c = false;

        Test.startTest();
        update activeEdition;
        Test.stopTest();
        Scholarship_Edition__c queriedEdition = [
            SELECT Id, Is_Active_Edition__c 
            FROM Scholarship_Edition__c 
            WHERE Id = :activeEdition.Id
        ];

        System.assertEquals(false, queriedEdition.Is_Active_Edition__c, 'The edition should be inactive now.');
    }
}