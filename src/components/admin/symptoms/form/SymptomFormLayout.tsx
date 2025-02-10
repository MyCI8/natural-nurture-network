
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { BasicInfoSection } from "./BasicInfoSection";
import { ImageManagementSection } from "../../news/ImageManagementSection";
import { ExpertsSection } from "../../news/ExpertsSection";
import { RelatedIngredientsSection } from "../RelatedIngredientsSection";
import { VideoLinksSection } from "../../news/VideoLinksSection";

interface SymptomFormLayoutProps {
  form: UseFormReturn<any>;
  experts: any[];
}

export const SymptomFormLayout = ({ form, experts }: SymptomFormLayoutProps) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form className="space-y-6">
              <BasicInfoSection form={form} />
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ImageManagementSection
            thumbnailUrl={form.watch("image_url") || ""}
            setThumbnailUrl={(url) => form.setValue("image_url", url)}
            thumbnailDescription={form.watch("thumbnail_description") || ""}
            setThumbnailDescription={(desc) => form.setValue("thumbnail_description", desc)}
            mainImageUrl=""
            setMainImageUrl={() => {}}
            mainImageDescription=""
            setMainImageDescription={() => {}}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ExpertsSection
            experts={experts}
            selectedExperts={form.watch("related_experts") || []}
            setSelectedExperts={(experts) => form.setValue("related_experts", experts)}
            onExpertAdded={() => {}}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <RelatedIngredientsSection
            selectedIngredients={form.watch("related_ingredients") || []}
            setSelectedIngredients={(ingredients) => form.setValue("related_ingredients", ingredients)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <VideoLinksSection
            videoLinks={form.watch("video_links") || []}
            setVideoLinks={(links) => form.setValue("video_links", links)}
            videoDescription={form.watch("video_description") || ""}
            setVideoDescription={(desc) => form.setValue("video_description", desc)}
          />
        </CardContent>
      </Card>
    </div>
  );
};
