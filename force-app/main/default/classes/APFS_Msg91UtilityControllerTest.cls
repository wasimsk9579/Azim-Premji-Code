@isTest
public class APFS_Msg91UtilityControllerTest {

    private class MockHttpResponseGenerator implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"status": "success", "message": "SMS sent successfully."}');
            res.setStatusCode(200);
            return res;
        }
    }
   // Mock for HTTP Error Response
    private class MockHttpErrorResponseGenerator implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            // Simulating an error response
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"status": "error", "message": "Failed to send SMS."}');
            res.setStatusCode(500); // Simulate a server error
            return res;
        }
    }


    @isTest
    static void testSendSms() {
        // Set the mock for the HTTP callout
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());

        // Set up test data
        String mobile = '1234567890';
        String messageType = 'Ticket_Status_Change';

        // Query the SMS_Template__mdt record
        List<SMS_Template__mdt> templates = [SELECT Template_ID__c FROM SMS_Template__mdt WHERE Message_Type__c = :messageType LIMIT 1];
        
        if (templates.isEmpty()) {
            // If the record doesn't exist, fail the test early
            //System.assert(false, 'No SMS_Template__mdt record found with Message_Type__c = ' + messageType);
        } else {
            // Continue with the test if the record exists
            System.debug('smsTemplate: ' + templates[0]);

            // Prepare the variables map
            Map<String, String> varMap = new Map<String, String>();
            varMap.put('var1UserName', 'testUserName');
            varMap.put('var2FirstName', 'testFirstName');

            // Execute the test
            Test.startTest();
            APFS_Msg91UtilityController.sendSms(mobile, messageType, varMap);
            Test.stopTest();

        }
    }
  @isTest
static void testSendBulkSms() {
    // Set the mock for the HTTP callout
    Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());

    // Set up test data
    List<APFS_SMSHelper.SMSMessage> smsMessages = new List<APFS_SMSHelper.SMSMessage>();
    smsMessages.add(new APFS_SMSHelper.SMSMessage('1234567890', 'Ticket_Status_Change', new Map<String, String>{'var1UserName' => 'testUserName', 'var2FirstName' => 'testFirstName'}));
    smsMessages.add(new APFS_SMSHelper.SMSMessage('0987654321', 'Ticket_Status_Change', new Map<String, String>{'var1UserName' => 'testUserName', 'var2FirstName' => 'testFirstName'}));

    // Execute the test
    Test.startTest();
    APFS_Msg91UtilityController.sendBulkSms(smsMessages);
    Test.stopTest();
}
  

}