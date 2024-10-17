@isTest
public class APFS_StateDistrictUtilityTest {

    @isTest
    static void testGetIndia() {
        // Setup test data
        Account testAccount = new Account(Name = 'India Geo Locations', Account_Type__c = 'Country');
        insert testAccount;
        
        // Test method
        Id resultId = APFS_StateDistrictUtilityController.getIndia();
        
        // Verify results
        System.assertEquals(testAccount.Id, resultId, 'The account ID should match the test account ID.');
    }

    @isTest
    static void testGetStateChildAccounts() {
        // Setup test data
        Account parentAccount = new Account(Name = 'India Geo Locations', Account_Type__c = 'Country');
        insert parentAccount;
        
        Account stateAccount = new Account(Name = 'Madhya Pradesh', ParentId = parentAccount.Id, Account_Type__c = 'State');
        insert stateAccount;
        
        // Test with valid IDs
        List<Id> parentAccountIds = new List<Id>{ parentAccount.Id };
        List<Account> stateAccounts = APFS_StateDistrictUtilityController.getStateChildAccounts(parentAccountIds);
        
        // Verify results
        System.assertEquals(1, stateAccounts.size(), 'There should be one state account.');
        System.assertEquals(stateAccount.Id, stateAccounts[0].Id, 'The state account ID should match the test account ID.');
        
        // Test with empty list to ensure exception is thrown
        List<Id> emptyList = new List<Id>();
        try {
            stateAccounts = APFS_StateDistrictUtilityController.getStateChildAccounts(emptyList);
            System.assertEquals(0, stateAccounts.size(), 'The list should be empty when no IDs are provided.');
        } catch (APFS_CustomException e) {
            System.assert(e.getMessage().contains('No parent account IDs provided'), 'Exception message should indicate missing parent account IDs.');
        }
    }

    @isTest
    static void testGetDistrictAccounts() {
        // Setup test data
        Account stateAccount = new Account(Name = 'Madhya Pradesh', Account_Type__c = 'State');
        insert stateAccount;
        
        Account districtAccount = new Account(Name = 'Bhopal', ParentId = stateAccount.Id, Account_Type__c = 'District');
        insert districtAccount;
        
        // Test with valid IDs
        List<Id> stateAccountIds = new List<Id>{ stateAccount.Id };
        List<Account> districtAccounts = APFS_StateDistrictUtilityController.getDistrictAccounts(stateAccountIds);
        
        // Verify results
        System.assertEquals(1, districtAccounts.size(), 'There should be one district account.');
        System.assertEquals(districtAccount.Id, districtAccounts[0].Id, 'The district account ID should match the test account ID.');
        
        // Test with empty list to ensure exception is thrown
        List<Id> emptyList = new List<Id>();
        try {
            districtAccounts = APFS_StateDistrictUtilityController.getDistrictAccounts(emptyList);
            System.assertEquals(0, districtAccounts.size(), 'The list should be empty when no IDs are provided.');
        } catch (APFS_CustomException e) {
            System.assert(e.getMessage().contains('No state account IDs provided'), 'Exception message should indicate missing state account IDs.');
        }
    }

    @isTest
    static void testGetBlockAccounts() {
        // Setup test data
        Account districtAccount = new Account(Name = 'Bhopal', Account_Type__c = 'District');
        insert districtAccount;
        
        Account blockAccount = new Account(Name = 'Block 1', ParentId = districtAccount.Id, Account_Type__c = 'Block');
        insert blockAccount;
        
        // Test with valid IDs
        List<Id> districtAccountIds = new List<Id>{ districtAccount.Id };
        List<Account> blockAccounts = APFS_StateDistrictUtilityController.getBlockAccounts(districtAccountIds);
        
        // Verify results
        System.assertEquals(1, blockAccounts.size(), 'There should be one block account.');
        System.assertEquals(blockAccount.Id, blockAccounts[0].Id, 'The block account ID should match the test account ID.');
        
        // Test with empty list to ensure exception is thrown
        List<Id> emptyList = new List<Id>();
        try {
            blockAccounts = APFS_StateDistrictUtilityController.getBlockAccounts(emptyList);
            System.assertEquals(0, blockAccounts.size(), 'The list should be empty when no IDs are provided.');
        } catch (APFS_CustomException e) {
            System.assert(e.getMessage().contains('No district account IDs provided'), 'Exception message should indicate missing district account IDs.');
        }
    }
    
    @isTest
    static void testFetchSpecificStates() {
        // Setup test data
        Account indiaGeoLocations = new Account(Name = 'India Geo Locations', Account_Type__c = 'Country');
        insert indiaGeoLocations;
        
        Account state1 = new Account(Name = 'Madhya Pradesh', ParentId = indiaGeoLocations.Id, Account_Type__c = 'State', Is_Participating_State__c = true);
        Account state2 = new Account(Name = 'Rajasthan', ParentId = indiaGeoLocations.Id, Account_Type__c = 'State', Is_Participating_State__c = true);
        insert new List<Account>{ state1, state2 };
        
        Map<Id, String> statesMap = APFS_StateDistrictUtilityController.fetchSpecificStates();
        
        // Verify results
        System.assert(statesMap.containsKey(state1.Id), 'The states map should contain Madhya Pradesh.');
        System.assert(statesMap.containsKey(state2.Id), 'The states map should contain Rajasthan.');
        
        // Test when there are no participating states
        delete state1;
        delete state2;
        statesMap = APFS_StateDistrictUtilityController.fetchSpecificStates();
        System.assertEquals(0, statesMap.size(), 'The states map should be empty when there are no states.');
    }

    @isTest
    static void testGetDistrictPicklistValues() {
        // Setup test data
        Account stateAccount = new Account(Name = 'Madhya Pradesh', Account_Type__c = 'State');
        insert stateAccount;
        
        Account districtAccount = new Account(Name = 'Bhopal', ParentId = stateAccount.Id, Account_Type__c = 'District');
        insert districtAccount;
        
        // Test with valid state account ID
        Map<Id, String> districtsMap = APFS_StateDistrictUtilityController.getDistrictPicklistValues(stateAccount.Id);
        System.assert(districtsMap.containsKey(districtAccount.Id), 'The districts map should contain Bhopal.');
        
        // Test with null state account ID to ensure exception is thrown
        try {
            districtsMap = APFS_StateDistrictUtilityController.getDistrictPicklistValues(null);
            System.assertEquals(0, districtsMap.size(), 'The districts map should be empty when an invalid state account ID is provided.');
        } catch (APFS_CustomException e) {
            System.assert(e.getMessage().contains('State ID cannot be null'), 'Exception message should indicate that the state ID is null.');
        }
    }

    @isTest
    static void testGetBlockPicklistValues() {
        // Setup test data
        Account districtAccount = new Account(Name = 'Bhopal', Account_Type__c = 'District');
        insert districtAccount;
        
        Account blockAccount = new Account(Name = 'Block 1', ParentId = districtAccount.Id, Account_Type__c = 'Block');
        insert blockAccount;
        
        // Test with valid district account ID
        Map<Id, String> blocksMap = APFS_StateDistrictUtilityController.getBlockPicklistValues(districtAccount.Id);
        System.assert(blocksMap.containsKey(blockAccount.Id), 'The blocks map should contain Block 1.');
        
        // Test with null district account ID to ensure exception is thrown
        try {
            blocksMap = APFS_StateDistrictUtilityController.getBlockPicklistValues(null);
            System.assertEquals(0, blocksMap.size(), 'The blocks map should be empty when an invalid district account ID is provided.');
        } catch (APFS_CustomException e) {
            System.assert(e.getMessage().contains('District ID cannot be null'), 'Exception message should indicate that the district ID is null.');
        }
    }

    @isTest
    static void testGetSpecificDistrictPicklistValues() {
        // Setup test data
        Account stateAccount = new Account(Name = 'Madhya Pradesh', Account_Type__c = 'State');
        insert stateAccount;
        
        Account district1 = new Account(Name = 'Bhopal', ParentId = stateAccount.Id, Account_Type__c = 'District',Is_Participating_District__c = true);
        Account district2 = new Account(Name = 'Indore', ParentId = stateAccount.Id, Account_Type__c = 'District',Is_Participating_District__c = true);
        insert new List<Account>{ district1, district2 };
        
        // Test with valid state account ID
        Map<Id, String> specificDistrictsMap = APFS_StateDistrictUtilityController.getSpecificDistrictPicklistValues(stateAccount.Id);
        System.assert(specificDistrictsMap.containsKey(district1.Id), 'The districts map should contain Bhopal.');
        System.assert(specificDistrictsMap.containsKey(district2.Id), 'The districts map should contain Indore.');
        
        // Test with null state account ID to ensure exception is thrown
        try {
            specificDistrictsMap = APFS_StateDistrictUtilityController.getSpecificDistrictPicklistValues(null);
            System.assertEquals(0, specificDistrictsMap.size(), 'The districts map should be empty when an invalid state account ID is provided.');
        } catch (APFS_CustomException e) {
            System.assert(e.getMessage().contains('State ID cannot be null'), 'Exception message should indicate that the state ID is null.');
        }
    }

   @isTest
    static void testGetStatePicklistValues() {
        // Setup test data
        Account countryAccount = new Account(Name = 'India Geo Locations', Account_Type__c = 'Country');
        insert countryAccount;
        
        Account state1 = new Account(Name = 'Madhya Pradesh', ParentId = countryAccount.Id, Account_Type__c = 'State');
        Account state2 = new Account(Name = 'Rajasthan', ParentId = countryAccount.Id, Account_Type__c = 'State');
        insert new List<Account>{ state1, state2 };
        
        // Mock the getIndia method to return the ID of the country account
        Test.startTest();
        // We assume the getIndia method returns the Id of the countryAccount
        Map<Id, String> statesMap = APFS_StateDistrictUtilityController.getStatePicklistValues();
        Test.stopTest();
        
        // Verify results
        System.assert(statesMap.containsKey(state1.Id), 'The states map should contain Madhya Pradesh.');
        System.assert(statesMap.containsKey(state2.Id), 'The states map should contain Rajasthan.');
        
        // Optionally, you can check if the map contains only expected values
        System.assertEquals(2, statesMap.size(), 'The states map should contain exactly 2 states.');
        System.assertEquals('Madhya Pradesh', statesMap.get(state1.Id), 'The state name for Madhya Pradesh should be correct.');
        System.assertEquals('Rajasthan', statesMap.get(state2.Id), 'The state name for Rajasthan should be correct.');
    }    
    @isTest
    static void testGetInstitutesBySearch() {
        // Setup test data
        Institute__c institute = new Institute__c(
            Institute_Name__c = 'Institute A',
            Institute_State__c = 'Madhya Pradesh',
            Institute_District__c = 'Bhopal'
        );
        insert institute;
        
        // Test with valid search criteria
        List<Institute__c> institutes = APFS_StateDistrictUtilityController.getInstitutesBySearch('Madhya Pradesh', 'Bhopal', 'Institute A');
        
        // Verify results
        System.assertEquals(1, institutes.size(), 'There should be one institute found.');
        System.assertEquals(institute.Id, institutes[0].Id, 'The institute ID should match the test institute ID.');
        
        // Test with no matching institutes
        institutes = APFS_StateDistrictUtilityController.getInstitutesBySearch('Madhya Pradesh', 'Bhopal', 'Nonexistent Institute');
        System.assertEquals(0, institutes.size(), 'There should be no institutes found for non-existent search criteria.');
    }

    @isTest
    static void testGetSchoolBySearch() {
        // Setup test data
        School__c school = new School__c(
            School_Name__c = 'School A',
            School_State__c = 'Madhya Pradesh',
            School_District__c = 'Bhopal',
            School_Block__c = 'RAMNAGAR'
        );
        insert school;
        
        // Test with valid search criteria
        List<School__c> schools = APFS_StateDistrictUtilityController.getSchoolBySearch('Madhya Pradesh', 'Bhopal', 'RAMNAGAR', 'School A');
        
        // Verify results
        System.assertEquals(1, schools.size(), 'There should be one school found.');
        System.assertEquals(school.Id, schools[0].Id, 'The school ID should match the test school ID.');
        
        // Test with no matching schools
        schools = APFS_StateDistrictUtilityController.getSchoolBySearch('Madhya Pradesh', 'Bhopal', 'RAMNAGAR', 'Nonexistent School');
        System.assertEquals(0, schools.size(), 'There should be no schools found for non-existent search criteria.');
    }

    @isTest
    static void testGetSchoolsOrBoard() {
        // Setup test data
        School__c school = new School__c(
            School_Name__c = 'School A',
            School_State__c = 'Madhya Pradesh',
            School_District__c = 'Bhopal',
			School_Block__c = 'RAMNAGAR',
            Is_Eight__c = True,
            Is_Ten__c = True,
            Is_Twelve__c = True
        );
        insert school;
        
        // Test with valid criteria
        List<School__c> result = APFS_StateDistrictUtilityController.getSchoolsOrBoard('Madhya Pradesh', 'Bhopal', 'RAMNAGAR','12');
        
        // Verify results
        System.assertNotEquals(null, result, 'The result should not be null.');
        System.assertEquals(1, result.size(), 'There should be one school in the result.');
        System.assertEquals(school.Id, result[0].Id, 'The school ID should match the test school ID.');
        
        // Test with no results
        result = APFS_StateDistrictUtilityController.getSchoolsOrBoard('Madhya Pradesh', 'Bhopal', 'Nonexistent School','12');
        System.assertEquals(0, result.size(), 'There should be no schools in the result for non-existent criteria.');
    }
}