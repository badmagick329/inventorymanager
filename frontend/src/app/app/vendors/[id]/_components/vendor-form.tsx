import { ICON_MD, ICON_SM } from '@/consts';
import { VendorResponse } from '@/types';
import { Button, useDisclosure } from '@nextui-org/react';
import { Pencil, Trash, Check } from 'lucide-react';
import { useState } from 'react';
import NameInput from './name-input';
import { useForm } from 'react-hook-form';
import { useCreateVendor, useDeleteVendor } from '@/hooks';
import axios from 'axios';
import DeleteModal from '@/components/delete-modal';

export default function VendorForm({
  vendor,
  locationId,
}: {
  vendor: VendorResponse;
  locationId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const createVendor = useCreateVendor();
  const deleteVendor = useDeleteVendor();
  const [error, setError] = useState('');
  const disclosure = useDisclosure();

  const defaultValues = {
    name: vendor.name,
  };
  const { register, handleSubmit, formState, setValue } = useForm({
    defaultValues,
  });

  async function submitForm(data: { name: string }, vendorId: number) {
    try {
      await createVendor.mutateAsync({
        ...data,
        locationId,
        vendorId: vendorId.toString(),
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorResponse = error.response?.data;
        if (error.response?.status === 400 && errorResponse) {
          for (const [_, value] of Object.entries(errorResponse)) {
            setError(`${value}`);
            return;
          }
        }
      }
      setError('Something went wrong');
    }
  }

  return (
    <form
      className='flex w-full justify-between px-6 md:w-2/3'
      onSubmit={handleSubmit((data) => submitForm(data, vendor.id))}
    >
      <NameInput
        name={vendor.name}
        isEditing={isEditing}
        error={error}
        register={register}
        formState={formState}
      />
      <div className='flex gap-4'>
        {isEditing && (
          <Button
            className='text-success-600'
            variant='light'
            type='submit'
            isDisabled={createVendor.isPending}
            isLoading={createVendor.isPending}
          >
            <Check size={ICON_MD} /> Done
          </Button>
        )}
        <Button
          onPress={() => setIsEditing((prev) => !prev)}
          className='text-warning-600'
          variant='light'
          isDisabled={createVendor.isPending}
        >
          <Pencil size={ICON_MD} /> {isEditing ? 'Cancel Edit' : 'Edit'}
        </Button>
        <Button
          className='text-danger-600'
          variant='light'
          isDisabled={createVendor.isPending}
          onPress={disclosure.onOpen}
        >
          <Trash size={ICON_MD} /> Delete
        </Button>
        <DeleteModal
          params={{ vendorId: vendor.id }}
          disclosure={disclosure}
          mutation={deleteVendor}
        />
      </div>
    </form>
  );
}
