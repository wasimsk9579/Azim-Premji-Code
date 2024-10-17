@isTest
public class APFS_SendUserNameTriggerHandlerTest {
    
    @isTest
    static void testSendUsername_Success() {
        Account acc = new Account(Name = 'Test Account');
        insert acc;

     
        Contact testContact = new Contact(
            FirstName = 'John',
            LastName = 'Doe',
            Email = 'johndoe@example.com',
            MobilePhone = '9053456784',
            AccountId = acc.Id
        );
        insert testContact;

        Profile profile = [SELECT Id FROM Profile WHERE Name = 'Scholarship Portal Applicant' LIMIT 1];
        User newUser = new User(
            FirstName = 'Jane',
            LastName = 'Smith',
            ContactId = testContact.Id,
            Email = 'janesmith@example.com',
            Username = 'janesmith123@example.com',
            Alias = 'jsmith',
            ProfileId = profile.Id,
            MobilePhone = '7975946497',
            CommunityNickname = 'janesmith',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            TimeZoneSidKey = 'America/New_York'
        );
        insert newUser;

        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        Test.startTest();
        APFS_SendUserNameTriggerHandler.sendUsername(new List<User> { newUser });
        Test.stopTest();

        System.debug('Test completed for sendUsername method with a valid user.');
    }


    private class MockHttpResponseGenerator implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"status": "success", "message": "SMS sent successfully."}');
            res.setStatusCode(200);
            return res;
        }
    }
}