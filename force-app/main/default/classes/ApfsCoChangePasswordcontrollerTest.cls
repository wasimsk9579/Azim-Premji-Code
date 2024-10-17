@isTest
private class ApfsCoChangePasswordcontrollerTest {

    @isTest
    static void testChangePasswordSuccess() {
        profile p= [SELECT Id FROM Profile WHERE Name = 'Scholarship Portal Applicant' LIMIT 1]; 
        Account acc = new account(
            Name='testPortal'
         );
           insert acc;
         Contact Con = new Contact(
            FirstName = 'Tese3t',
            LastName = 'Contaect',
            Email = 'testcontact@example.com',
            MobilePhone	= '9053456784',
            AccountId = acc.Id
        );
        
        insert Con;
        
        User testUser = new User(
            FirstName = 'Test',
            LastName = 'User1',
            Alias = 'test1',
            Email = 'testuser@example.com',
            ContactId = Con.Id,
            EmailEncodingKey = 'UTF-8',
            CommunityNickname = 'tesjtuser',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = p.Id,
            MobilePhone = '7975946497',
            TimeZoneSidKey = 'America/Los_Angeles',
            UserName = 'testuser23@example.com'
        );
        insert testUser;

        String oldPassword = 'OldPassword123!';
        String newPassword = 'NewPassword123!';
        String verifyNewPassword = 'NewPassword123!';

        System.runAs(testUser) {
            Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
            Test.startTest();
            String result = ApfsCoChangePasswordcontroller.changePassword(newPassword, verifyNewPassword, oldPassword);
            Test.stopTest();

            System.assertEquals('Success', result, 'The password change should be successful');
        }
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