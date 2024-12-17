import { Component } from "solid-js";
import FocusModal from "../components/ui/FocusModal";
import Button from "../components/ui/Button";
import Dropdown from "../components/Dropdown";
import { BoxTypesLive, PortraitOptions } from "../utils/options";
import Switch from "../components/ui/Switch";
import { usePortraitConfig } from "../context/portraitConfigProvider";

interface PortraitConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const PortraitConfig: Component<PortraitConfigProps> = (props) => {
  const { config, setConfig } = usePortraitConfig();

  return (
    <>
      <FocusModal
        title="Message box settings"
        isOpen={props.isOpen}
        onClose={props.onClose}
      >
        <div class="m-2">
          <div class="grid grid-cols-1 gap-2 max-h-[610px] overflow-y-auto">
            <div class="bg-secondary p-2">
              <h2 class="text-lg font-medium">Box settings</h2>

              <div id="box">
                <div class="mt-2">
                  <Dropdown
                    options={BoxTypesLive}
                    value={config.boxType}
                    onChange={(value) =>
                      setConfig({ boxType: value.toString() })
                    }
                    label="Box type"
                  />
                </div>
              </div>
            </div>

            <div class="bg-secondary p-2">
              <h2 class="text-lg font-medium">Portrait settings</h2>

              <div id="portrait">
                <div class="mt-2">
                  <Switch
                    label="Include portrait"
                    checked={config.includePortrait}
                    onChange={() => {
                      setConfig({ includePortrait: !config.includePortrait });
                    }}
                  />

                  <Dropdown
                    options={PortraitOptions}
                    value={config.portraitId}
                    onChange={(value) =>
                      setConfig({ portraitId: value.toString() })
                    }
                    disabled={!config.includePortrait}
                    label="Portrait"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="absolute bottom-6 right-6">
            <Button variant="secondary" onClick={props.onSave}>
              Confirm
            </Button>
          </div>
        </div>
      </FocusModal>
    </>
  );
};

export default PortraitConfig;
