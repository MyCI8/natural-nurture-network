import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { 
  ArrowLeft, Bold, Italic, AlignLeft, AlignCenter, 
  AlignRight, List, ListOrdered, Table as TableIcon,
  Image as ImageIcon, Trash2, Plus, X
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database } from "@/integrations/supabase/types";

type SymptomType = Database['public']['Enums']['symptom_type'];

const defaultSymptoms: SymptomType[] = [
  'Cough', 'Cold', 'Sore Throat', 'Cancer', 'Stress', 
  'Anxiety', 'Depression', 'Insomnia', 'Headache', 'Joint Pain',
  'Digestive Issues', 'Fatigue', 'Skin Irritation', 'High Blood Pressure', 'Allergies',
  'Weak Immunity', 'Back Pain', 'Poor Circulation', 'Hair Loss', 'Eye Strain'
];

const fontFamilies = [
  'Arial',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana'
];

const EditRemedy = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomType[]>([]);
  const [selectedExperts, setSelectedExperts] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [shoppingList, setShoppingList] = useState<Array<{ name: string; url: string }>>([]);
  const [newShoppingItem, setNewShoppingItem] = useState({ name: "", url: "" });

  const { data: remedy, isLoading: isLoadingRemedy } = useQuery({
    queryKey: ["remedy", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("remedies")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: experts } = useQuery({
    queryKey: ["experts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experts")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: expertRemedies } = useQuery({
    queryKey: ["expert_remedies", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expert_remedies")
        .select("expert_id")
        .eq("remedy_id", id);
      if (error) throw error;
      return data;
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[500px] p-4",
      },
    },
  });

  useEffect(() => {
    if (remedy) {
      setName(remedy.name);
      setSummary(remedy.summary);
      setImageUrl(remedy.image_url);
      setSelectedSymptoms(remedy.symptoms || []);
      setIngredients(remedy.ingredients || []);
      setShoppingList(remedy.shopping_list || []);
      editor?.commands.setContent(remedy.description || "");
    }
  }, [remedy, editor]);

  useEffect(() => {
    if (expertRemedies) {
      setSelectedExperts(expertRemedies.map(er => er.expert_id));
    }
  }, [expertRemedies]);

  const handleSave = async () => {
    try {
      // Update remedy
      const { error: remedyError } = await supabase
        .from("remedies")
        .update({
          name,
          summary,
          description: editor?.getHTML(),
          image_url: imageUrl,
          symptoms: selectedSymptoms,
          ingredients,
          shopping_list: shoppingList
        })
        .eq("id", id);

      if (remedyError) throw remedyError;

      // Update expert recommendations
      if (expertRemedies) {
        const currentExpertIds = expertRemedies.map(er => er.expert_id);
        
        // Remove old recommendations
        const expertsToRemove = currentExpertIds.filter(eid => !selectedExperts.includes(eid));
        if (expertsToRemove.length > 0) {
          const { error } = await supabase
            .from("expert_remedies")
            .delete()
            .eq("remedy_id", id)
            .in("expert_id", expertsToRemove);
          if (error) throw error;
        }

        // Add new recommendations
        const expertsToAdd = selectedExperts.filter(eid => !currentExpertIds.includes(eid));
        if (expertsToAdd.length > 0) {
          const { error } = await supabase
            .from("expert_remedies")
            .insert(expertsToAdd.map(expertId => ({
              expert_id: expertId,
              remedy_id: id
            })));
          if (error) throw error;
        }
      }

      toast({
        title: "Success",
        description: "Remedy updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update remedy",
        variant: "destructive",
      });
    }
  };

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addShoppingItem = () => {
    if (newShoppingItem.name.trim() && newShoppingItem.url.trim()) {
      setShoppingList([...shoppingList, { ...newShoppingItem }]);
      setNewShoppingItem({ name: "", url: "" });
    }
  };

  const removeShoppingItem = (index: number) => {
    setShoppingList(shoppingList.filter((_, i) => i !== index));
  };

  if (isLoadingRemedy) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/remedies")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Remedies
        </Button>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="summary">Summary</Label>
              <Input
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Symptoms</Label>
            <Select
              value={selectedSymptoms[selectedSymptoms.length - 1]}
              onValueChange={(value: SymptomType) => {
                if (!selectedSymptoms.includes(value)) {
                  setSelectedSymptoms([...selectedSymptoms, value]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select symptoms" />
              </SelectTrigger>
              <SelectContent>
                {defaultSymptoms.map((symptom) => (
                  <SelectItem key={symptom} value={symptom}>
                    {symptom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedSymptoms.map((symptom, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {symptom}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedSymptoms(selectedSymptoms.filter((_, i) => i !== index))}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Expert Recommendations</Label>
            <Select
              value={selectedExperts[selectedExperts.length - 1]}
              onValueChange={(value) => {
                if (!selectedExperts.includes(value)) {
                  setSelectedExperts([...selectedExperts, value]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select experts" />
              </SelectTrigger>
              <SelectContent>
                {experts?.map((expert) => (
                  <SelectItem key={expert.id} value={expert.id}>
                    {expert.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedExperts.map((expertId, index) => {
                const expert = experts?.find(e => e.id === expertId);
                return expert ? (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {expert.full_name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedExperts(selectedExperts.filter((_, i) => i !== index))}
                    />
                  </Badge>
                ) : null;
              })}
            </div>
          </div>

          <div>
            <Label>Ingredients</Label>
            <div className="flex gap-2">
              <Input
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                placeholder="Enter ingredient"
              />
              <Button onClick={addIngredient}>Add</Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {ingredients.map((ingredient, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {ingredient}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeIngredient(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Shopping List</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newShoppingItem.name}
                  onChange={(e) => setNewShoppingItem({ ...newShoppingItem, name: e.target.value })}
                  placeholder="Item name"
                />
                <Input
                  value={newShoppingItem.url}
                  onChange={(e) => setNewShoppingItem({ ...newShoppingItem, url: e.target.value })}
                  placeholder="Purchase URL"
                />
                <Button onClick={addShoppingItem}>Add</Button>
              </div>
              <div className="space-y-2">
                {shoppingList.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <span className="flex-grow">{item.name}</span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Link
                    </a>
                    <X
                      className="h-4 w-4 cursor-pointer"
                      onClick={() => removeShoppingItem(index)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label>Thumbnail</Label>
            <div className="mt-2 flex items-center gap-4">
              {imageUrl && (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Thumbnail"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2"
                    onClick={() => setImageUrl("")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Label
                htmlFor="thumbnail"
                className="cursor-pointer flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg hover:border-primary"
              >
                <input
                  type="file"
                  id="thumbnail"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                <Plus className="h-6 w-6 text-gray-400" />
              </Label>
            </div>
          </div>

          <div className="border rounded-lg">
            <div className="border-b p-4 flex flex-wrap gap-2">
              <Select
                value={editor?.getAttributes('textStyle').fontFamily}
                onValueChange={(value) => editor?.chain().focus().setFontFamily(value).run()}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Font Family" />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font} value={font}>{font}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={editor?.isActive('bold') ? "bg-muted" : ""}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={editor?.isActive('italic') ? "bg-muted" : ""}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                className={editor?.isActive({ textAlign: 'left' }) ? "bg-muted" : ""}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                className={editor?.isActive({ textAlign: 'center' }) ? "bg-muted" : ""}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                className={editor?.isActive({ textAlign: 'right' }) ? "bg-muted" : ""}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={editor?.isActive('bulletList') ? "bg-muted" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={editor?.isActive('orderedList') ? "bg-muted" : ""}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={addTable}
              >
                <TableIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={addImage}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>
            <EditorContent editor={editor} />
          </div>

          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default EditRemedy;
