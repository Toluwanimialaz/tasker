import React from 'react'

import OnboardingModal from './OnboardModal'
import { AlertModal } from './AlertModal'
import {AlertFlash} from './AlertFlash'
import { DescriptionModal } from './DescriptionModal'
import {VerificationModal} from './VerificationModal'
import { SideBarMenu } from './SideBarMenu'
import { DeleteTaskModal } from './deleteModal'

export default function Globalmodals(){
    return(
        <>
         <AlertModal/>
         <AlertFlash/>
         <SideBarMenu/>
         <DescriptionModal/>
         <DeleteTaskModal/>
         
        </>
    )
}