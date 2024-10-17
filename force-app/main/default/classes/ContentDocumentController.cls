public with sharing class ContentDocumentController {
    @AuraEnabled
    public static void deleteContentDocument(String contentDocumentId) {
        try {
            // Query ContentDocumentLink records to remove links
            List<ContentDocumentLink> contentDocumentLinks = [
                SELECT Id
                FROM ContentDocumentLink
                WHERE ContentDocumentId = :contentDocumentId
            ];

            if (!contentDocumentLinks.isEmpty()) {
                delete contentDocumentLinks; // This will remove the links but not the ContentDocument
            }

            // Query and delete ContentDocument records
            List<ContentDocument> contentDocuments = [
                SELECT Id
                FROM ContentDocument
                WHERE Id = :contentDocumentId
            ];

            if (!contentDocuments.isEmpty()) {
                delete contentDocuments; // This will remove the ContentDocument and associated ContentVersion
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting content document: ' + e.getMessage());
        }
    }
}