import styles from './form.module.scss';

function CustomForm({ title="", description="",onSubmit, children }) {
  return (
    <form onSubmit={onSubmit}>
      <div className={`card ${styles.custom_form_card}`}>
        <div className="card-body">
          {title && <h5 className="card-title">{title}</h5>}
          {description && <p className="card-text">
            {description}
          </p>}
          {children}
        </div>
      </div>
    </form>
  );
}

export default CustomForm;
