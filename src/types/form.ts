
export interface BaseFormData {
  [key: string]: any;
}

export interface FormValidationError {
  field: string;
  message: string;
}

export interface FormHookReturn<T extends BaseFormData> {
  formData: T;
  isLoading: boolean;
  isSaving: boolean;
  errors: FormValidationError[];
  handleInputChange: (field: string, value: any) => void;
  handleSubmit: (shouldPublish?: boolean) => Promise<void>;
  validateForm: () => string | null;
}

export interface FormLayoutProps {
  title: string;
  onBack: () => void;
  onSave?: (shouldPublish?: boolean) => void;
  isSaving?: boolean;
  showPublishOption?: boolean;
  children: React.ReactNode;
}

export interface FormActionsProps {
  onSave: (shouldPublish?: boolean) => void;
  isSaving: boolean;
  showPublishOption?: boolean;
  saveLabel?: string;
  publishLabel?: string;
}
