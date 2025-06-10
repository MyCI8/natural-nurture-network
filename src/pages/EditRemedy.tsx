
import { Loader2 } from "lucide-react";
import { useRemedyForm } from "@/hooks/useRemedyForm";
import { RemedyFormLayout } from "@/components/remedies/edit/RemedyFormLayout";
import { RemedyFormColumns } from "@/components/remedies/edit/RemedyFormColumns";

const EditRemedy = () => {
  const {
    formData,
    images,
    links,
    selectedExperts,
    isLoading,
    isSaving,
    handleInputChange,
    handleImagesChange,
    setLinks,
    setSelectedExperts,
    handleSave,
    navigate
  } = useRemedyForm();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <RemedyFormLayout
      onBack={() => navigate("/admin/remedies")}
      onSave={handleSave}
      isSaving={isSaving}
    >
      <RemedyFormColumns
        formData={formData}
        images={images}
        links={links}
        selectedExperts={selectedExperts}
        onInputChange={handleInputChange}
        onImagesChange={handleImagesChange}
        onLinksChange={setLinks}
        onExpertsChange={setSelectedExperts}
      />
    </RemedyFormLayout>
  );
};

export default EditRemedy;
