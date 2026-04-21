import { ArrowLeftIcon, ImageIcon, TypeIcon, FileTextIcon, SaveIcon, VanIcon, Calendar } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
// import api from './../lib/axios';

function EditProductForm({ product, isPending, isError, onSubmit }) {
  const [formData, setFormData] = useState({
    title: product.title,
    description: product.description,
    imageUrl: product.imageUrl,
    // handoverDate: product.handoverDate,
    // releaseDate: product.releaseDate
    handoverDate: product.handoverDate?.split("T")[0],
    releaseDate: product.releaseDate?.split("T")[0] || "",


  });
  const [imageFile, setImageFile] = useState(null);

  return (
    <div className="max-w-lg mx-auto">
      <Link to="/profile" className="btn btn-ghost btn-sm gap-1 mb-4">
        <ArrowLeftIcon className="size-4" /> Back
      </Link>

      <div className="card bg-base-300">
        <div className="card-body">
          <h1 className="card-title">
            <SaveIcon className="size-5 text-primary" />
            Edit Vehicle
          </h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData();

              data.append("title", formData.title);
              data.append("description", formData.description);
              data.append("handoverDate", formData.handoverDate);
              data.append("releaseDate", formData.releaseDate);

              if (imageFile) {
                data.append("image", imageFile); //  must match multer field
              }

              onSubmit(data); //  send FormData
            }}
            className="space-y-4 mt-4"
          >
            <label className="input input-bordered flex items-center gap-2 bg-base-200">
              <VanIcon className="size-4 text-base-content/50" />
              <input
                type="text"
                placeholder="Vehicle model *"
                className="grow"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </label>

            {/* Vehicle Handover Date */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-primary">Drop-off date *</label>
              <label className="input input-bordered flex items-center gap-2 bg-base-200">
                <Calendar className="size-4 text-base-content/50" />
                <input
                  type="date"
                  placeholder="Drop-off date"
                  className="grow"
                  value={formData.handoverDate}
                  onChange={(e) =>
                    setFormData({ ...formData, handoverDate: e.target.value })
                  }
                />
              </label>
            </div>

            <div className="flex flex-col gap-2">

              <label className="text-sm font-semibold text-primary">Vehicle Image</label>
              {/* <ImageIcon className="size-4 text-base-content/50" /> */}
              {/* <input
                type="url"
                placeholder="Image URL"
                className="grow"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                required
              /> */}
              <input
                type="file"
                accept="image/*"
                className="file-input file-input-bordered flex items-center gap-2 bg-base-200"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </div>

            {/* {formData.imageUrl && (
              <div className="rounded-box overflow-hidden">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-40 object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )} */}
            {/* OLD IMAGE */}
            {!imageFile && product.imageUrl && (
              <div className="rounded-box overflow-hidden">
                <img
                  src={product.imageUrl}
                  className="w-full h-40 object-cover"
                />
              </div>
            )}

            {/* NEW IMAGE PREVIEW */}
            {imageFile && (
              <div className="rounded-box overflow-hidden">
                <img
                  src={URL.createObjectURL(imageFile)}
                  className="w-full h-40 object-cover"
                />
              </div>
            )}

            {/* Vehicle Release Date */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-primary">Vehicle Pickup date</label>
              <label className="input input-bordered flex items-center gap-2 bg-base-200">
                <Calendar className="size-4 text-base-content/50" />
                <input
                  type="date"
                  placeholder="Vehicle Pickup date"
                  className="grow"
                  value={formData.releaseDate}
                  onChange={(e) =>
                    setFormData({ ...formData, releaseDate: e.target.value })
                  }
                />
              </label>
            </div>

            <div className="form-control">
              <div className="flex items-start gap-2 p-3 rounded-box bg-base-200 border border-base-300">
                <FileTextIcon className="size-4 text-base-content/50 mt-1" />
                <textarea
                  placeholder="Description *"
                  className="grow bg-transparent resize-none focus:outline-none min-h-24"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
            </div>

            {isError && (
              <div role="alert" className="alert alert-error alert-sm">
                <span>Failed to update. Try again.</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
              {isPending ? <span className="loading loading-spinner" /> : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default EditProductForm;