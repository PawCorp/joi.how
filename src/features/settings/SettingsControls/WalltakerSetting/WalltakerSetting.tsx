import React, {ChangeEvent} from 'react'
import '../settings.css'
import './WalltakerSetting.css'

interface IWalltakerSettingProps {
  enabled: boolean,
  link: number | null,
  setLink: (newLink: number | null) => void
}

export function WalltakerSetting(props: IWalltakerSettingProps) {
  const setLink = (e: ChangeEvent<HTMLInputElement>) => {
    const linkString = e.target.value;
    const link = parseInt(linkString.replace(/\D/g, ''), 10);
    props.setLink(Number.isNaN(link) ? null : link)
  };

  return (
    <fieldset className={props.enabled ? 'settings-group' : 'settings-group--disabled'}>
      <legend>Walltaker</legend>
      <div className="settings-row">
        <strong>Import porn from an active Walltaker link.</strong>
      </div>
      <div className="settings-row">
        <div className="settings-innerrow">
          <label>
            <span>Link ID</span>
            <input type="text" value={props.link ?? ''} onChange={setLink}/>
          </label>
        </div>
      </div>

      <div className="settings-row">
        <em>
          Make an account at <a href="https://walltaker.joi.how" target={"_blank"}>walltaker.joi.how</a> to generate a
          link.
        </em>
        <em>
          Once you start a session, new posts will be imported to your porn list automatically.
        </em>
      </div>
    </fieldset>
  )
}
