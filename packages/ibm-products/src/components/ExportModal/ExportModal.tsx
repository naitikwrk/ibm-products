//
// Copyright IBM Corp. 2020, 2021
//
// This source code is licensed under the Apache-2.0 license found in the
// LICENSE file in the root directory of this source tree.
//

import React, {
  useState,
  useRef,
  forwardRef,
  useEffect,
  ReactNode,
} from 'react';
import {
  Button,
  ComposedModal,
  ModalHeader,
  ModalFooter,
  ModalBody,
  TextInput,
  RadioButton,
  RadioButtonGroup,
  FormGroup,
  Loading,
  PasswordInput,
} from '@carbon/react';
import cx from 'classnames';
import { ErrorFilled, CheckmarkFilled } from '@carbon/react/icons';
import PropTypes from 'prop-types';

import { getDevtoolsProps } from '../../global/js/utils/devtools';
import uuidv4 from '../../global/js/utils/uuidv4';
import { pkg } from '../../settings';
import { usePortalTarget } from '../../global/js/hooks/usePortalTarget';
import { deprecateProp } from '../../global/js/utils/props-helper';

const componentName = 'ExportModal';

// Default values for props
const defaults = {
  inputType: 'text',
  preformattedExtensions: Object.freeze([]),
  validExtensions: Object.freeze([]),
};

type InputType = 'text' | 'password';

type PreformattedExtensions = {
  extension?: string;
  description?: string;
};
interface ExportModalProps extends React.ComponentProps<typeof ComposedModal> {
  /**
   * Body content for the modal
   */
  body?: string;
  /**
   * Optional class name
   */
  className?: string;
  /**
   * specify if an error occurred
   */
  error?: boolean;
  /**
   * messaging to display in the event of an error
   */
  errorMessage?: string;
  /**
   * name of the file being exported
   */
  filename: string;
  /**
   * label text that's displayed when hovering over visibility toggler to hide key
   */
  hidePasswordLabel?: string;
  /**
   * **Deprecated** Set `labelText` in `inputProps` instead
   */
  inputLabel?: string;
  /**
   * Input props
   */
  inputProps?: React.ComponentProps<typeof TextInput>;
  /**
   * specify the type of text input
   */
  inputType: InputType;
  /**
   * **Deprecated** Set `invalidText` in `inputProps` instead
   */
  invalidInputText?: string;
  /**
   * specify if the modal is in a loading state
   */
  loading?: boolean;
  /**
   * message to display during the loading state
   */
  loadingMessage?: string;
  /**
   * Specify a handler for closing modal
   */
  onClose?: () => void;
  /**
   * Specify a handler for "submitting" modal. Returns the file name
   */
  onRequestSubmit?: (value?: string) => void;
  /**
   * Specify whether the Modal is currently open
   */
  open?: boolean;
  /**
   * The DOM node the tearsheet should be rendered within. Defaults to document.body.
   */
  portalTarget?: ReactNode;
  /**
   * Array of extensions to display as radio buttons
   */
  preformattedExtensions: readonly PreformattedExtensions[];
  /**
   * Label for the preformatted label form group
   */
  preformattedExtensionsLabel?: string;
  /**
   * Specify the text for the primary button
   */
  primaryButtonText: string;
  /**
   * Specify the text for the secondary button
   */
  secondaryButtonText: string;
  /**
   * label text that's displayed when hovering over visibility toggler to show key
   */
  showPasswordLabel?: string;
  /**
   * messaging to display if the export was successful
   */
  successMessage?: string;
  /**
   * specify if the export was successful
   */
  successful?: boolean;
  /**
   * The text displayed at the top of the modal
   */
  title: string;
  /**
   * array of valid extensions the file can have
   */
  validExtensions: readonly any[];
}

/**
 * Modal dialog version of the export pattern
 */
export let ExportModal = forwardRef(
  (
    {
      // The component props, in alphabetical order (for consistency).

      body,
      className,
      error,
      errorMessage,
      filename,
      hidePasswordLabel,
      inputLabel,
      inputProps,
      inputType = 'text',
      invalidInputText,
      loading,
      loadingMessage,
      onClose,
      onRequestSubmit,
      open,
      portalTarget: portalTargetIn,
      preformattedExtensions = defaults.preformattedExtensions,
      preformattedExtensionsLabel,
      primaryButtonText,
      secondaryButtonText,
      showPasswordLabel,
      successMessage,
      successful,
      title,
      validExtensions = defaults.validExtensions,

      // Collect any other property values passed in.
      ...rest
    }: React.PropsWithChildren<ExportModalProps>,
    ref
  ) => {
    const [name, setName] = useState('');
    const [dirtyInput, setDirtyInput] = useState(false);
    // by default (if it exists) use the first extension in the extension array
    const [extension, setExtension] = useState('');
    const renderPortalUse = usePortalTarget(portalTargetIn);

    useEffect(() => {
      setName(filename);
      if (
        preformattedExtensions &&
        preformattedExtensions.length > 0 &&
        preformattedExtensions[0]?.extension
      ) {
        setExtension(preformattedExtensions?.[0]?.extension);
      }
    }, [filename, preformattedExtensions, open]);

    const onNameChangeHandler = (evt) => {
      setName(evt.target.value);
      inputProps?.onChange?.(evt);
    };

    const onExtensionChangeHandler = (value) => {
      setExtension(value);
    };

    const onBlurHandler = (evt) => {
      setDirtyInput(true);
      inputProps?.onBlur?.(evt);
    };

    const onSubmitHandler = () => {
      const returnName = extension
        ? `${filename}.${extension.toLocaleLowerCase()}`
        : name;
      onRequestSubmit && onRequestSubmit(returnName);
    };

    const hasInvalidExtension = () => {
      if (!dirtyInput || !validExtensions || !validExtensions.length) {
        return false;
      }
      if (!name.includes('.')) {
        return true;
      }
      const ext = name.split('.').pop();
      if (!validExtensions.includes(ext)) {
        return true;
      }
      return false;
    };

    const blockClass = `${pkg.prefix}--export-modal`;
    const internalId = useRef(uuidv4());
    const primaryButtonDisabled =
      inputProps?.invalid ||
      loading ||
      (inputType === 'text' ? !name?.trim() : !name) ||
      hasInvalidExtension();
    const submitted = loading || error || successful;

    const commonInputProps = {
      ...(inputProps || {}),
      id: inputProps?.id || `text-input--${internalId.current}`,
      value: name,
      onChange: onNameChangeHandler,
      labelText: inputProps?.labelText || inputLabel,
      invalid: inputProps?.invalid || hasInvalidExtension(),
      invalidText: inputProps?.invalidText || invalidInputText,
      onBlur: onBlurHandler,
      ['data-modal-primary-focus']: true,
    };

    return renderPortalUse(
      <ComposedModal
        {...rest}
        className={cx(blockClass, className)}
        aria-label={title}
        size="sm"
        preventCloseOnClickOutside
        {...{ open, ref, onClose, ...getDevtoolsProps(componentName) }}
      >
        <ModalHeader
          className={`${blockClass}__header`}
          closeModal={onClose}
          title={title}
        />
        <ModalBody className={`${blockClass}__body-container`}>
          {!submitted && (
            <>
              {body && <p className={`${blockClass}__body`}>{body}</p>}
              {preformattedExtensions.length ? (
                <FormGroup legendText={preformattedExtensionsLabel}>
                  <RadioButtonGroup
                    orientation="vertical"
                    onChange={onExtensionChangeHandler}
                    valueSelected={extension}
                    name="extensions"
                  >
                    {preformattedExtensions.map((o) => (
                      <RadioButton
                        key={o.extension}
                        id={o.extension}
                        value={o.extension}
                        labelText={`${o.extension} (${o.description})`}
                        data-modal-primary-focus
                      />
                    ))}
                  </RadioButtonGroup>
                </FormGroup>
              ) : (
                <div className={`${blockClass}__input-container`}>
                  {inputType === 'text' ? (
                    <TextInput {...commonInputProps} />
                  ) : (
                    <PasswordInput
                      {...commonInputProps}
                      showPasswordLabel={showPasswordLabel}
                      hidePasswordLabel={hidePasswordLabel}
                      tooltipPosition="left"
                    />
                  )}
                </div>
              )}
            </>
          )}
          <div className={`${blockClass}__messaging`}>
            {loading && (
              <>
                <Loading small withOverlay={false} />
                <p>{loadingMessage}</p>
              </>
            )}
            {successful && (
              <>
                <CheckmarkFilled
                  size={16}
                  className={`${blockClass}__checkmark-icon`}
                />
                <p>{successMessage}</p>
              </>
            )}
            {error && (
              <>
                <ErrorFilled
                  size={16}
                  className={`${blockClass}__error-icon`}
                />
                <p>{errorMessage}</p>
              </>
            )}
          </div>
        </ModalBody>
        {!submitted && (
          <ModalFooter className={`${blockClass}__footer`}>
            <Button type="button" kind="secondary" onClick={onClose}>
              {secondaryButtonText}
            </Button>
            <Button
              type="submit"
              kind="primary"
              onClick={onSubmitHandler}
              disabled={primaryButtonDisabled}
            >
              {primaryButtonText}
            </Button>
          </ModalFooter>
        )}
      </ComposedModal>
    );
  }
);

// Return a placeholder if not released and not enabled by feature flag
ExportModal = pkg.checkComponentEnabled(ExportModal, componentName);

const deprecatedProps = {
  /**
   * **Deprecated** Set `labelText` in `inputProps` instead
   */
  inputLabel: deprecateProp(
    PropTypes.string,
    'Set `labelText` in `inputProps` instead'
  ),
  /**
   * **Deprecated** Set `invalidText` in `inputProps` instead
   */
  invalidInputText: deprecateProp(
    PropTypes.string,
    'Set `invalidText` in `inputProps` instead'
  ),
};

ExportModal.propTypes = {
  /**
   * Body content for the modal
   */
  /**@ts-ignore*/
  body: PropTypes.string,
  /**
   * Optional class name
   */
  className: PropTypes.string,
  /**
   * specify if an error occurred
   */
  error: PropTypes.bool,
  /**
   * messaging to display in the event of an error
   */
  errorMessage: PropTypes.string,
  /**
   * name of the file being exported
   */
  filename: PropTypes.string.isRequired,
  /**
   * label text that's displayed when hovering over visibility toggler to hide key
   */
  hidePasswordLabel: PropTypes.string,
  /**
   * Input props
   */
  inputProps: PropTypes.object,
  /**
   * specify the type of text input
   */
  /**@ts-ignore */
  inputType: PropTypes.oneOf(['text', 'password']),
  /**
   * specify if the modal is in a loading state
   */
  loading: PropTypes.bool,
  /**
   * message to display during the loading state
   */
  loadingMessage: PropTypes.string,
  /**
   * Specify a handler for closing modal
   */
  onClose: PropTypes.func,
  /**
   * Specify a handler for "submitting" modal. Returns the file name
   */
  onRequestSubmit: PropTypes.func,
  /**
   * Specify whether the Modal is currently open
   */
  open: PropTypes.bool,
  /**
   * The DOM node the tearsheet should be rendered within. Defaults to document.body.
   */
  portalTarget: PropTypes.node,
  /**
   * Array of extensions to display as radio buttons
   */
  /**@ts-ignore */
  preformattedExtensions: PropTypes.arrayOf(
    PropTypes.shape({
      extension: PropTypes.string,
      description: PropTypes.string,
    })
  ),
  /**
   * Label for the preformatted label form group
   */
  preformattedExtensionsLabel: PropTypes.string,
  /**
   * Specify the text for the primary button
   */
  primaryButtonText: PropTypes.string.isRequired,
  /**
   * Specify the text for the secondary button
   */
  secondaryButtonText: PropTypes.string.isRequired,
  /**
   * label text that's displayed when hovering over visibility toggler to show key
   */
  showPasswordLabel: PropTypes.string,
  /**
   * messaging to display if the export was successful
   */
  successMessage: PropTypes.string,
  /**
   * specify if the export was successful
   */
  successful: PropTypes.bool,
  /**
   * The text displayed at the top of the modal
   */
  title: PropTypes.string.isRequired,
  /**
   * array of valid extensions the file can have
   */
  /**@ts-ignore */
  validExtensions: PropTypes.array,
  ...deprecatedProps,
};

ExportModal.displayName = componentName;
