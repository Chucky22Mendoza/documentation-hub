'use client'

import React, { useState } from 'react';
import { useForm, useFieldArray, Control, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { DocProject, PROJECT_TYPES } from '@/lib/docs';
import { saveProject, uploadImage } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus, Image as ImageIcon, Save, ArrowLeft } from 'lucide-react';

// Form Types
type FormValues = DocProject;

interface DocFormProps {
  initialData?: DocProject;
  slug?: string;
}

// Custom Textarea component to match shadcn style
const TextareaCustom = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
        ref={ref}
        {...props}
      />
    )
  }
)
TextareaCustom.displayName = "TextareaCustom"

export function DocForm({ initialData, slug }: DocFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagsError, setTagsError] = useState('');
  const [tagsInput, setTagsInput] = useState(initialData?.metadata?.tags?.join(', ') || '');

  const { control, register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: initialData || {
      metadata: { title: '', description: '', type: 'FrontEnd', tags: [] },
      pages: []
    }
  });

  const { fields: pageFields, append: appendPage, remove: removePage } = useFieldArray({
    control,
    name: "pages"
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const result = await saveProject(slug, data);
      if (result.success && result.slug) {
        router.push(`/docs/${result.slug}`);
        router.refresh();
      } else {
        alert('Error submitting: ' + result.error);
      }
    } catch (e) {
      console.error(e);
      alert('Error submitting');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Header / Actions */}
      <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-40 p-4 border-b rounded-b-lg mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" type="button" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">{slug ? 'Edit Documentation' : 'Create Documentation'}</h1>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Project</>}
        </Button>
      </div>

      {/* Metadata Section */}
      <Card>
        <CardHeader>
          <CardTitle>Project Metadata</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input {...register("metadata.title", { required: true })} placeholder="Project Title" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Controller
                control={control}
                name="metadata.type"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <TextareaCustom {...register("metadata.description")} placeholder="Short description..." />
          </div>
          <div className="space-y-2">
            <Label>Tags (comma separated)</Label>
            <Controller
              control={control}
              name="metadata.tags"
              render={({ field }) => (
                <>
                  <Input
                    value={tagsInput}
                    onChange={(e) => {
                      setTagsInput(e.target.value);
                      setTagsError(''); // Clear error while typing
                    }}
                    onBlur={() => {
                      const value = tagsInput.trim();

                      // Validate: check if there are commas
                      if (value && !value.includes(',')) {
                        setTagsError('Los tags deben estar separados por comas');
                        return;
                      }

                      // Process tags: split by comma, trim, and filter empty
                      const tags = value.split(',').map(s => s.trim()).filter(Boolean);
                      field.onChange(tags);
                      setTagsInput(tags.join(', '));
                      setTagsError('');
                    }}

                    placeholder="react, typescript, ui"
                    className={tagsError ? 'border-destructive' : ''}
                  />
                  {tagsError && (
                    <p className="text-sm text-destructive">{tagsError}</p>
                  )}
                </>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pages Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Documentation Pages</h2>
          <Button type="button" onClick={() => appendPage({ title: '', purpose: '', page_notes: [] })} variant="secondary">
            <Plus className="w-4 h-4 mr-2" /> Add Page
          </Button>
        </div>

        {pageFields.map((field, index) => (
          <PageEditor key={field.id} index={index} control={control} remove={() => removePage(index)} />
        ))}
      </div>
    </form>
  );
}

function PageEditor({ index, control, remove }: { index: number, control: Control<FormValues>, remove: () => void }) {
  const { fields: noteFields, append: appendNote, remove: removeNote } = useFieldArray({
    control,
    name: `pages.${index}.page_notes`
  });

  return (
    <Card className="border-l-4 border-l-primary/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Page {index + 1}</CardTitle>
        <Button variant="ghost" size="icon" type="button" onClick={remove} className="text-destructive hover:bg-destructive/10">
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Page Title</Label>
            <Input {...control.register(`pages.${index}.title`, { required: true })} placeholder="Page Title" />
          </div>
          <div className="space-y-2">
            <Label>Parent Page (Title)</Label>
            <Input {...control.register(`pages.${index}.parent`)} placeholder="Parent Page Title (optional)" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Purpose</Label>
          <TextareaCustom {...control.register(`pages.${index}.purpose`)} placeholder="Page Purpose" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Key References</Label>
          </div>
          <Controller
            control={control}
            name={`pages.${index}.references`}
            render={({ field }) => (
              <div className="space-y-2">
                {field.value?.map((ref, refIdx) => (
                  <div key={refIdx} className="flex gap-2 items-start p-3 bg-muted/30 rounded-md">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="URL (e.g., https://github.com/...)"
                        value={ref.url || ''}
                        onChange={(e) => {
                          const newRefs = [...(field.value || [])];
                          newRefs[refIdx] = { ...newRefs[refIdx], url: e.target.value };
                          field.onChange(newRefs);
                        }}
                        className="text-xs"
                      />
                      <Input
                        placeholder="Display text (e.g., /src/app/component.tsx)"
                        value={ref.placeholder || ''}
                        onChange={(e) => {
                          const newRefs = [...(field.value || [])];
                          newRefs[refIdx] = { ...newRefs[refIdx], placeholder: e.target.value };
                          field.onChange(newRefs);
                        }}
                        className="text-xs font-mono"
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        const newRefs = field.value?.filter((_, i) => i !== refIdx);
                        field.onChange(newRefs);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newRefs = [...(field.value || []), { url: '', placeholder: '' }];
                    field.onChange(newRefs);
                  }}
                  className="w-full"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Reference
                </Button>
                {(!field.value || field.value.length === 0) && (
                  <p className="text-xs text-muted-foreground italic">No references added yet</p>
                )}
              </div>
            )}
          />
        </div>

        {/* Notes/Content Sections */}
        <div className="pl-4 border-l-2 border-muted space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">Content Sections</h3>
            <Button type="button" size="sm" variant="outline" onClick={() => appendNote({ title: '', content: '' })}>
              <Plus className="w-3 h-3 mr-2" /> Add Section
            </Button>
          </div>
          {noteFields.map((noteField, noteIndex) => (
            <NoteEditor
              key={noteField.id}
              pageIndex={index}
              noteIndex={noteIndex}
              control={control}
              remove={() => removeNote(noteIndex)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function NoteEditor({ pageIndex, noteIndex, control, remove }: { pageIndex: number, noteIndex: number, control: Control<FormValues>, remove: () => void }) {

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: string) => void, currentValue: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    const res = await uploadImage(data);
    if (res.url) {
      const newVal = (currentValue || '') + `\n![${file.name}](${res.url})\n`;
      onChange(newVal);
    } else {
      alert("Upload failed");
    }
  };

  return (
    <div className="bg-muted/30 p-4 rounded-md space-y-3 relative group">
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={remove}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
      </Button>

      <div className="space-y-2">
        <Input
          {...control.register(`pages.${pageIndex}.page_notes.${noteIndex}.title`)}
          placeholder="Section Title (optional)"
          className="font-medium bg-background"
        />
      </div>
      <div className="space-y-2">
        <Controller
          control={control}
          name={`pages.${pageIndex}.page_notes.${noteIndex}.content`}
          render={({ field }) => (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Markdown Content</Label>
                <div className="relative">
                  <input
                    type="file"
                    id={`upload-${pageIndex}-${noteIndex}`}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, field.onChange, field.value)}
                  />
                  <Label htmlFor={`upload-${pageIndex}-${noteIndex}`} className="cursor-pointer text-xs text-primary flex items-center hover:underline">
                    <ImageIcon className="w-3 h-3 mr-1" /> Add Image
                  </Label>
                </div>
              </div>
              <TextareaCustom
                {...field}
                className="font-mono text-sm min-h-[150px]"
                placeholder="# Markdown supported..."
              />
            </div>
          )}
        />
      </div>
    </div>
  )
}
