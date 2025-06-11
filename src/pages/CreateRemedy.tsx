
import React, { useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormLayout } from "@/components/shared/form/FormLayout";
import { CreateRemedyFormColumns } from "@/components/remedies/create/CreateRemedyFormColumns";
import { useCreateRemedyForm } from "@/hooks/useCreateRemedyForm";

const CreateRemedy = () => {
  const {
    formData,
    images,
    links,
    currentUser,
    isLoading,
    isSaving,
    handleInputChange,
    setImages,
    setLinks,
    handleSubmit,
    navigate
  } = useCreateRemedyForm();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isLoading && !currentUser) {
      toast("Please sign in to create a remedy");
      navigate("/auth");
    }
  }, [currentUser, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-background z-10 md:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/remedies')}
          className="rounded-full h-10 w-10 touch-manipulation"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        
        <h1 className="text-lg font-semibold">Create Natural Remedy</h1>
        
        <Button
          onClick={handleSubmit}
          disabled={isSaving}
          size="sm"
          className="touch-manipulation"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? 'Creating...' : 'Create'}
        </Button>
      </header>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <FormLayout
          title="Create Natural Remedy"
          onBack={() => navigate('/remedies')}
        >
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <CreateRemedyFormColumns
              formData={formData}
              images={images}
              links={links}
              onInputChange={handleInputChange}
              onImagesChange={setImages}
              onLinksChange={setLinks}
              onSubmit={handleSubmit}
              isSaving={isSaving}
              onCancel={() => navigate('/remedies')}
            />
          </form>
        </FormLayout>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden px-2 py-4">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <CreateRemedyFormColumns
            formData={formData}
            images={images}
            links={links}
            onInputChange={handleInputChange}
            onImagesChange={setImages}
            onLinksChange={setLinks}
            onSubmit={handleSubmit}
            isSaving={isSaving}
            onCancel={() => navigate('/remedies')}
          />

          {/* Mobile Submit Button */}
          <div className="mt-8">
            <Button 
              type="submit" 
              className="w-full py-6 rounded-full touch-manipulation"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Create Remedy
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRemedy;
