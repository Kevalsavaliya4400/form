import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useFormStore, FormStyle } from '../store/formStore';
import { useAuthStore } from '../store/authStore';
import { FormElement } from './FormElement';
import { Toolbox } from './Toolbox';
import { StyleEditor } from './StyleEditor';
import { FormPreview } from './FormPreview';
import { SubmissionsView } from './SubmissionsView';
import { Save, Eye, Settings, LayoutDashboard, Loader2, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const FormBuilder = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const { currentForm, fetchForm, saveForm, updateForm } = useFormStore();
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [elements, setElements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('editor');
  const [style, setStyle] = useState<FormStyle>({
    backgroundColor: '#ffffff',
    textColor: '#000000',
    buttonColor: '#3b82f6',
    borderRadius: '0.5rem',
    fontFamily: 'Inter, system-ui, sans-serif',
  });
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    const loadForm = async () => {
      if (formId) {
        const form = await fetchForm(formId);
        if (form) {
          setFormTitle(form.title);
          setFormDescription(form.description || '');
          setElements(form.elements);
          setStyle(form.style);
        }
      }
      setLoading(false);
    };
    loadForm();
  }, [formId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (!formTitle.trim()) {
        toast.error('Please enter a form title');
        return;
      }

      if (!user) {
        toast.error('You must be logged in to save forms');
        return;
      }

      const formData = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        elements,
        style,
        userId: user.uid,
      };

      if (formId) {
        await updateForm(formId, formData);
      } else {
        const newFormId = await saveForm(formData);
        navigate(`/builder/${newFormId}`);
      }
      toast.success('Form saved successfully');
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    
    if (over && active.id !== over.id) {
      const oldIndex = elements.findIndex((e) => e.id === active.id);
      const newIndex = elements.findIndex((e) => e.id === over.id);
      setElements(arrayMove(elements, oldIndex, newIndex));
    }
  };

  const handleDragStart = (event: any) => {
    setActiveDragId(event.active.id);
  };

  const addElement = (element: any) => {
    const newElement = { ...element, id: crypto.randomUUID() };
    setElements([...elements, newElement]);
    toast.success(`Added ${element.type} element`);
  };

  const removeElement = (id: string) => {
    setElements(elements.filter((element) => element.id !== id));
    toast.success('Element removed');
  };

  const updateElement = (id: string, updates: Partial<any>) => {
    setElements(elements.map((element) => 
      element.id === id ? { ...element, ...updates } : element
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton height={40} className="mb-4" />
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <Skeleton height={400} />
            </div>
            <div className="col-span-6">
              <Skeleton height={600} />
            </div>
            <div className="col-span-3">
              <Skeleton height={400} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <LayoutDashboard className="h-6 w-6 text-blue-600 mr-2" />
              <span className="font-semibold text-lg">Form Builder</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'editor'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Settings size={20} />
                  Editor
                </div>
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Eye size={20} />
                  Preview
                </div>
              </button>
              {formId && (
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'submissions'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ListFilter size={20} />
                    Submissions
                  </div>
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save size={20} />
                )}
                {saving ? 'Saving...' : 'Save Form'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <input
            type="text"
            placeholder="Form Title"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="text-3xl font-bold bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none w-full mb-2 transition-colors"
          />
          <input
            type="text"
            placeholder="Form Description (optional)"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            className="w-full text-gray-600 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none transition-colors"
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'editor' && (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-12 gap-6"
            >
              <div className="col-span-3">
                <div className="sticky top-24">
                  <Toolbox onAddElement={addElement} />
                </div>
              </div>
              
              <div className="col-span-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter} 
                    onDragEnd={handleDragEnd}
                    onDragStart={handleDragStart}
                  >
                    <SortableContext items={elements} strategy={verticalListSortingStrategy}>
                      <AnimatePresence>
                        {elements.map((element) => (
                          <motion.div
                            key={element.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                          >
                            <FormElement
                              element={element}
                              onRemove={removeElement}
                              onUpdate={updateElement}
                              style={style}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </SortableContext>

                    <DragOverlay>
                      {activeDragId ? (
                        <div className="bg-white rounded-lg shadow-lg border-2 border-blue-500 p-4 opacity-80">
                          {elements.find(e => e.id === activeDragId)?.label}
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                  
                  {elements.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <div className="mx-auto h-12 w-12 text-gray-400">
                        <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No elements</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by adding elements from the toolbox</p>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="col-span-3">
                <div className="sticky top-24 space-y-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowStyleEditor(!showStyleEditor)}
                    className="w-full flex items-center justify-center gap-2 p-4 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Settings size={20} />
                    {showStyleEditor ? 'Hide Style Editor' : 'Show Style Editor'}
                  </motion.button>

                  <AnimatePresence mode="wait">
                    {showStyleEditor ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <StyleEditor style={style} onChange={setStyle} />
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white rounded-lg shadow-sm p-6"
                      >
                        <h3 className="text-lg font-semibold mb-4">Form Stats</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total Elements</span>
                            <span className="font-semibold">{elements.length}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Required Fields</span>
                            <span className="font-semibold">
                              {elements.filter(e => e.required).length}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FormPreview
                title={formTitle}
                description={formDescription}
                elements={elements}
                style={style}
                onSubmit={async (responses) => {
                  console.log('Preview submission:', responses);
                  toast.success('This is a preview. Submissions are disabled.');
                }}
              />
            </motion.div>
          )}

          {activeTab === 'submissions' && formId && (
            <motion.div
              key="submissions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SubmissionsView formId={formId} elements={elements} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};